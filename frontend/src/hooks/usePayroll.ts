import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { toHex, fromHex } from "@midnight-ntwrk/midnight-js/utils";
import { connectWallet, disconnectWallet, deriveIdentitySecretKey } from "../midnight/dappConnector";
import { buildProviders } from "../midnight/providers";
import {
  createPayrollRun as createPayrollRunCircuit,
  fundPayroll as fundPayrollCircuit,
  withdraw as withdrawCircuit,
  finalizePayroll as finalizePayrollCircuit,
  getPayrollLedgerState,
  deploy as deployPayroll,
  joinContract as joinPayrollContract,
  derivePublicKey,
  computeCommitment,
  computeNullifier,
  type DeployedPayrollContract,
  type PayrollProviders,
  type PayrollRun,
  type ShieldedPool,
  type WithdrawalProofData,
} from "../midnight/payrollContract";
import { defaultContractAddress } from "../midnight/config";

export type LedgerState = {
  payrollRuns: PayrollRun[];
  shieldedPool: ShieldedPool | null;
  nullifierCount: bigint;
};

export type WalletInfo = {
  walletName: string;
  unshieldedAddress: string;
  shieldedAddress: string;
};

// Simple Merkle tree implementation for off-chain use
class MerkleTree {
  leaves: Uint8Array[];
  tree: Uint8Array[][];

  constructor(leaves: Uint8Array[]) {
    this.leaves = leaves;
    this.tree = this.buildTree(leaves);
  }

  private hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
    // Simplified hash - in production use Poseidon
    const combined = new Uint8Array(left.length + right.length);
    combined.set(left);
    combined.set(right, left.length);
    return crypto.subtle.digest("SHA-256", combined) as any;
  }

  private buildTree(leaves: Uint8Array[]): Uint8Array[][] {
    const tree: Uint8Array[][] = [leaves];
    let currentLevel = leaves;
    while (currentLevel.length > 1) {
      const nextLevel: Uint8Array[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(this.hashPair(left, right));
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }
    return tree;
  }

  getRoot(): Uint8Array {
    return this.tree[this.tree.length - 1][0];
  }

  // Fixed-depth (4-level) proof to match the contract's MerkleProof shape
  // (path0..path3 + a 32-byte indices bitmask). Levels beyond the tree's
  // actual depth are padded with zero siblings and left (0) indices — the
  // contract's verifyMerkleProof is a single-leaf stub today (see
  // payroll.compact), so only proof.leaf is actually checked.
  getProof(index: number): { leaf: Uint8Array; path: Uint8Array[]; indices: number[] } {
    const leaf = this.leaves[index];
    const path: Uint8Array[] = [];
    const indices: number[] = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      const sibling = this.tree[level][siblingIndex] || this.tree[level][currentIndex];
      path.push(sibling);
      indices.push(isRight ? 1 : 0);
      currentIndex = Math.floor(currentIndex / 2);
    }

    while (path.length < 4) {
      path.push(new Uint8Array(32));
      indices.push(0);
    }

    return { leaf, path, indices };
  }
}

// The actual stateful implementation — call this exactly once, in App.tsx,
// and share the result via PayrollContext. Every other component reads it
// through usePayroll() below; calling this hook directly from more than one
// component would give each caller its own independent wallet/contract
// state instead of sharing the one connection.
export const usePayrollState = () => {
  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [providers, setProviders] = useState<PayrollProviders | null>(null);
  const [contract, setContract] = useState<DeployedPayrollContract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | undefined>(
    defaultContractAddress,
  );
  const [ledgerState, setLedgerState] = useState<LedgerState | null>(null);
  const [identitySecretKeyHex, setIdentitySecretKeyHex] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<{ txId: string; blockHeight?: number } | null>(null);
  const [role, setRole] = useState<"employer" | "employee" | null>(null);

  const isConnected = api !== null;
  const publicKey = useMemo(
    () => identitySecretKeyHex ? derivePublicKey(new Uint8Array(fromHex(identitySecretKeyHex))) : null,
    [identitySecretKeyHex],
  );

  const connect = useCallback(async () => {
    setError(null);
    setBusy("Connecting to Lace...");
    try {
      const { api: connectedApi, walletName, unshieldedAddress, shieldedAddress } =
        await connectWallet();
      setApi(connectedApi);
      setWallet({ walletName, unshieldedAddress, shieldedAddress });
      const [built, identitySecretKey] = await Promise.all([
        buildProviders(connectedApi),
        deriveIdentitySecretKey(connectedApi),
      ]);
      setProviders(built);
      setIdentitySecretKeyHex(toHex(identitySecretKey));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setApi(null);
    setWallet(null);
    setProviders(null);
    setContract(null);
    setLedgerState(null);
    setIdentitySecretKeyHex(null);
    setLastTx(null);
    setError(null);
    setRole(null);
  }, []);

  const refreshLedgerState = useCallback(
    async (address: string, currentProviders: PayrollProviders) => {
      const state = await getPayrollLedgerState(currentProviders, address);
      setLedgerState(state);
    },
    [],
  );

  const waitForIndexer = useCallback(
    async (
      address: string,
      currentProviders: PayrollProviders,
      maxAttempts = 10,
      delayMs = 1500,
    ) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, delayMs));
        const state = await getPayrollLedgerState(currentProviders, address);
        if (state) return state;
      }
      return getPayrollLedgerState(currentProviders, address);
    },
    [],
  );

  // identitySecretKeyHex is set by connect() (derived from the wallet's
  // signature — see dappConnector.ts) before either of these can be called,
  // so both use it as the default and only accept an override for testing.
  const join = useCallback(
    async (address: string, identitySecretKeyOverride?: string) => {
      if (!providers) return;
      setError(null);
      setBusy("Loading contract...");
      try {
        const hex = identitySecretKeyOverride ?? identitySecretKeyHex;
        if (!hex) throw new Error("No wallet identity available — reconnect and try again");
        const identitySecretKey = new Uint8Array(fromHex(hex));
        const found = await joinPayrollContract(providers, address, identitySecretKey);
        setContract(found);
        setContractAddress(address);
        await refreshLedgerState(address, providers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [providers, identitySecretKeyHex, refreshLedgerState],
  );

  const deploy = useCallback(
    async (identitySecretKeyOverride?: string) => {
      if (!providers) return;
      setError(null);
      setBusy("Deploying payroll contract...");
      try {
        const hex = identitySecretKeyOverride ?? identitySecretKeyHex;
        if (!hex) throw new Error("No wallet identity available — reconnect and try again");
        const identitySecretKey = new Uint8Array(fromHex(hex));
        const deployed = await deployPayroll(providers, identitySecretKey);
        setContract(deployed);
        setContractAddress(deployed.deployTxData.public.contractAddress);
        await refreshLedgerState(deployed.deployTxData.public.contractAddress, providers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [providers, identitySecretKeyHex, refreshLedgerState],
  );

  // Employer: Create payroll run
  const employerCreatePayrollRun = useCallback(
    async (employees: EmployeeRegistrationData[], totalAmount: bigint) => {
      if (!contract || !providers || !contractAddress) return;
      setError(null);
      setBusy("Creating payroll run...");

      try {
        // Build Merkle tree from employee commitments
        const leaves = employees.map((emp) => {
          const pubkey = new Uint8Array(fromHex(emp.pubkey));
          const amount = emp.amount;
          const nonce = new Uint8Array(fromHex(emp.nonce));
          const commitmentHex = computeCommitment(pubkey, amount, nonce);
          return new Uint8Array(fromHex(commitmentHex));
        });

        const tree = new MerkleTree(leaves);
        const merkleRoot = toHex(tree.getRoot());

        // Create payroll run on-chain
        const tx = await createPayrollRunCircuit(contract, merkleRoot, totalAmount);
        setLastTx({ txId: tx.txId, blockHeight: tx.blockHeight });

        // Fund the shielded pool (simplified - in reality this uses Zswap)
        // For demo, we just create a dummy commitment
        const shieldedSecret = crypto.getRandomValues(new Uint8Array(32));
        const digest = await crypto.subtle.digest("SHA-256", shieldedSecret);
        const noteCommitment = toHex(new Uint8Array(digest));

        await fundPayrollCircuit(contract, noteCommitment, totalAmount);

        await waitForIndexer(contractAddress, providers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [contract, providers, contractAddress, waitForIndexer],
  );

  // Employer: Finalize payroll
  const employerFinalizePayroll = useCallback(
    async (runId: bigint) => {
      if (!contract || !providers || !contractAddress) return;
      setError(null);
      setBusy("Finalizing payroll...");

      try {
        const tx = await finalizePayrollCircuit(contract);
        setLastTx({ txId: tx.txId, blockHeight: tx.blockHeight });
        await waitForIndexer(contractAddress, providers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [contract, providers, contractAddress, waitForIndexer],
  );

  // Employee: Withdraw salary
  const employeeWithdraw = useCallback(
    async (runId: bigint, employee: EmployeeData) => {
      if (!contract || !providers || !contractAddress) return;
      setError(null);
      setBusy("Generating ZK proof & withdrawing...");

      try {
        // Build Merkle tree to get proof for this employee
        const leaves = employee.merkleLeaves.map((leaf) => new Uint8Array(fromHex(leaf)));
        const tree = new MerkleTree(leaves);
        const proof = tree.getProof(employee.index);

        const pubkey = new Uint8Array(fromHex(employee.pubkey));
        const amount = employee.amount;
        const nonce = new Uint8Array(fromHex(employee.nonce));
        const commitment = new Uint8Array(fromHex(computeCommitment(pubkey, amount, nonce)));
        const nullifier = computeNullifier(commitment, nonce);

        const indicesBitmask = new Uint8Array(32);
        proof.indices.forEach((bit, i) => {
          if (bit) indicesBitmask[31 - Math.floor(i / 8)] |= 1 << i % 8;
        });

        const withdrawalProof: WithdrawalProofData = {
          merkleProof: {
            leaf: toHex(proof.leaf),
            path0: toHex(proof.path[0]),
            path1: toHex(proof.path[1]),
            path2: toHex(proof.path[2]),
            path3: toHex(proof.path[3]),
            indices: toHex(indicesBitmask),
          },
          nullifier,
          amount,
          pubkey: employee.pubkey,
          nonce: employee.nonce,
        };

        const tx = await withdrawCircuit(contract, withdrawalProof);
        setLastTx({ txId: tx.txId, blockHeight: tx.blockHeight });
        await waitForIndexer(contractAddress, providers);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [contract, providers, contractAddress, waitForIndexer],
  );

  useEffect(() => {
    if (isConnected && providers && defaultContractAddress && contract === null) {
      join(defaultContractAddress);
    }
  }, [isConnected, providers, contract, join]);

  return useMemo(
    () => ({
      isConnected,
      wallet,
      contractAddress,
      ledgerState,
      identitySecretKeyHex,
      publicKey,
      busy,
      error,
      lastTx,
      role,
      hasContract: contract !== null,
      connect,
      disconnect,
      join,
      deploy,
      setRole,
      employerCreatePayrollRun,
      employerFinalizePayroll,
      employeeWithdraw,
    }),
    [
      isConnected,
      wallet,
      contractAddress,
      ledgerState,
      identitySecretKeyHex,
      publicKey,
      busy,
      error,
      lastTx,
      role,
      contract,
      connect,
      disconnect,
      join,
      deploy,
      employerCreatePayrollRun,
      employerFinalizePayroll,
      employeeWithdraw,
    ],
  );
};

export const PayrollContext = createContext<ReturnType<typeof usePayrollState> | null>(
  null,
);

// Read the shared payroll/wallet state set up by <PayrollProvider> (App.tsx).
export const usePayroll = () => {
  const ctx = useContext(PayrollContext);
  if (!ctx) {
    throw new Error("usePayroll() must be used within a PayrollContext.Provider");
  }
  return ctx;
};

// What the employer needs to register one employee into the payroll tree.
export type EmployeeRegistrationData = {
  pubkey: string;
  amount: bigint;
  nonce: string;
};

// What an employee needs to prove their own membership and withdraw —
// their own commitment inputs plus enough of the tree to build a proof.
export type EmployeeData = EmployeeRegistrationData & {
  index: number;
  merkleLeaves: string[]; // All leaves for proof generation
};