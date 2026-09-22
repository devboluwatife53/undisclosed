import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import {
  deployContract,
  findDeployedContract,
  type DeployedContract,
  type FoundContract,
} from "@midnight-ntwrk/midnight-js/contracts";
import type { FinalizedTxData, MidnightProviders } from "@midnight-ntwrk/midnight-js/types";
import { assertIsContractAddress, toHex, fromHex } from "@midnight-ntwrk/midnight-js/utils";
import type { ProvableCircuitId } from "@midnight-ntwrk/compact-js";
import {
  Payroll,
  createPayrollPrivateState,
  witnesses,
  type PayrollPrivateState,
} from "@undisclosed/contract";
import { zkConfigBaseUrl } from "./config";

export type PayrollCircuits = ProvableCircuitId<Payroll.Contract<PayrollPrivateState>>;

export const PayrollPrivateStateId = "payrollPrivateState";

export type PayrollProviders = MidnightProviders<
  PayrollCircuits,
  typeof PayrollPrivateStateId,
  PayrollPrivateState
>;

export type PayrollContract = Payroll.Contract<PayrollPrivateState>;
export type DeployedPayrollContract =
  | DeployedContract<PayrollContract>
  | FoundContract<PayrollContract>;

export type PayrollRun = {
  id: bigint;
  employer: string;
  merkleRoot: string;
  totalCommitted: bigint;
  isActive: boolean;
  isFinalized: boolean;
};

export type ShieldedPool = {
  noteCommitment: string;
  value: bigint;
  isSpent: boolean;
};

const payrollCompiledContract = CompiledContract.make(
  "payroll",
  Payroll.Contract<PayrollPrivateState>,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigBaseUrl),
);

// The contract tracks a single active run at a time (currentRun), not a
// list — payrollRuns here is 0-or-1-length to keep the frontend's list
// rendering code working without assuming multi-run support that the
// contract doesn't have yet.
export const getPayrollLedgerState = async (
  providers: PayrollProviders,
  contractAddress: ContractAddress,
) => {
  assertIsContractAddress(contractAddress);
  const state = await providers.publicDataProvider.queryContractState(contractAddress);
  if (state == null) return null;
  const l = Payroll.ledger(state.data);
  const runs: PayrollRun[] =
    l.payrollCounter > 0n
      ? [
          {
            id: l.currentRun.id,
            employer: toHex(l.currentRun.employer),
            merkleRoot: toHex(l.currentRun.merkleRoot),
            totalCommitted: l.currentRun.totalCommitted,
            isActive: l.currentRun.isActive === 1n,
            isFinalized: l.currentRun.isFinalized === 1n,
          },
        ]
      : [];
  return {
    payrollRuns: runs,
    shieldedPool:
      l.shieldedPool.value > 0n
        ? {
            noteCommitment: toHex(l.shieldedPool.noteCommitment),
            value: l.shieldedPool.value,
            isSpent: l.shieldedPool.isSpent === 1n,
          }
        : null,
    nullifierCount: l.nullifierCount,
  };
};

export const deploy = async (
  providers: PayrollProviders,
  identitySecretKey: Uint8Array,
): Promise<DeployedPayrollContract> => {
  const privateState: PayrollPrivateState = createPayrollPrivateState(
    identitySecretKey,
    identitySecretKey,
    0n,
    new Uint8Array(32),
    new Uint8Array(32),
    0n,
  );
  return deployContract(providers, {
    compiledContract: payrollCompiledContract,
    privateStateId: PayrollPrivateStateId,
    initialPrivateState: privateState,
  });
};

export const joinContract = async (
  providers: PayrollProviders,
  contractAddress: string,
  identitySecretKey: Uint8Array,
): Promise<DeployedPayrollContract> =>
  findDeployedContract(providers, {
    contractAddress,
    compiledContract: payrollCompiledContract,
    privateStateId: PayrollPrivateStateId,
    initialPrivateState: createPayrollPrivateState(
      identitySecretKey,
      identitySecretKey,
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    ),
  });

export const createPayrollRun = async (
  contract: DeployedPayrollContract,
  merkleRoot: string,
  totalCommitted: bigint,
): Promise<FinalizedTxData> => {
  const finalizedTxData = await contract.callTx.createPayrollRun(
    new Uint8Array(fromHex(merkleRoot)),
    totalCommitted,
  );
  return finalizedTxData.public;
};

// The contract's fundPayroll/withdraw/finalizePayroll circuits act on
// whichever run is currentRun — there's only ever one active run, so
// these don't take a runId (kept in the frontend's own types only as a
// display label for the run, not something the contract needs).
export const fundPayroll = async (
  contract: DeployedPayrollContract,
  noteCommitment: string,
  value: bigint,
): Promise<FinalizedTxData> => {
  const finalizedTxData = await contract.callTx.fundPayroll(
    new Uint8Array(fromHex(noteCommitment)),
    value,
  );
  return finalizedTxData.public;
};

export const withdraw = async (
  contract: DeployedPayrollContract,
  proof: WithdrawalProofData,
): Promise<FinalizedTxData> => {
  const finalizedTxData = await contract.callTx.withdraw({
    merkleProof: {
      leaf: new Uint8Array(fromHex(proof.merkleProof.leaf)),
      path0: new Uint8Array(fromHex(proof.merkleProof.path0)),
      path1: new Uint8Array(fromHex(proof.merkleProof.path1)),
      path2: new Uint8Array(fromHex(proof.merkleProof.path2)),
      path3: new Uint8Array(fromHex(proof.merkleProof.path3)),
      indices: new Uint8Array(fromHex(proof.merkleProof.indices)),
    },
    nullifier: new Uint8Array(fromHex(proof.nullifier)),
    amount: bigintTo32Bytes(proof.amount),
    pubkey: new Uint8Array(fromHex(proof.pubkey)),
    nonce: new Uint8Array(fromHex(proof.nonce)),
  });
  return finalizedTxData.public;
};

export const finalizePayroll = async (
  contract: DeployedPayrollContract,
): Promise<FinalizedTxData> => {
  const finalizedTxData = await contract.callTx.finalizePayroll();
  return finalizedTxData.public;
};

// amount is a Bytes<32> witness on-chain (see payroll.compact), so it has
// to be padded to 32 bytes big-endian, not passed as a raw bigint.
export const bigintTo32Bytes = (value: bigint): Uint8Array => {
  const bytes = new Uint8Array(32);
  let v = value;
  for (let i = 31; i >= 0 && v > 0n; i--) {
    bytes[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return bytes;
};

export type WithdrawalProofData = {
  merkleProof: {
    leaf: string;
    path0: string;
    path1: string;
    path2: string;
    path3: string;
    indices: string;
  };
  nullifier: string;
  amount: bigint;
  pubkey: string;
  nonce: string;
};

export const derivePublicKey = (secretKey: Uint8Array): string =>
  toHex(Payroll.pureCircuits.publicKey(secretKey));

export const computeCommitment = (
  pubkey: Uint8Array,
  amount: bigint,
  nonce: Uint8Array
): string =>
  toHex(Payroll.pureCircuits.computeCommitment(pubkey, bigintTo32Bytes(amount), nonce));

export const computeNullifier = (
  commitment: Uint8Array,
  secret: Uint8Array
): string =>
  toHex(Payroll.pureCircuits.computeNullifier(commitment, secret));