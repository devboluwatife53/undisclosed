import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  type PayrollRun,
  type ShieldedPool,
  ledger,
  pureCircuits,
} from "../managed/payroll/contract/index.js";
import {
  type PayrollPrivateState,
  createPayrollPrivateState,
  witnesses,
} from "../payroll-witnesses.js";
import { randomBytes } from "./utils.js";

/**
 * Test simulator for the payroll contract.
 * Exercises circuits without a real network, prover, or indexer.
 */
export class PayrollSimulator {
  readonly contract: Contract<PayrollPrivateState>;
  circuitContext: CircuitContext<PayrollPrivateState>;

  constructor(
    employerSecretKey: Uint8Array,
    employeeSecretKey: Uint8Array,
    employeeAmount: bigint,
    employeeNonce: Uint8Array,
    shieldedNoteSecret: Uint8Array,
    shieldedNoteValue: bigint,
  ) {
    this.contract = new Contract<PayrollPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext(
        createPayrollPrivateState(
          employerSecretKey,
          employeeSecretKey,
          employeeAmount,
          employeeNonce,
          shieldedNoteSecret,
          shieldedNoteValue,
        ),
        "0".repeat(64),
      ),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public switchEmployer(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = createPayrollPrivateState(
      secretKey,
      this.circuitContext.currentPrivateState.employeeSecretKey,
      this.circuitContext.currentPrivateState.employeeAmount,
      this.circuitContext.currentPrivateState.employeeNonce,
      this.circuitContext.currentPrivateState.shieldedNoteSecret,
      this.circuitContext.currentPrivateState.shieldedNoteValue,
    );
  }

  public switchEmployee(secretKey: Uint8Array, amount: bigint, nonce: Uint8Array) {
    this.circuitContext.currentPrivateState = createPayrollPrivateState(
      this.circuitContext.currentPrivateState.employerSecretKey,
      secretKey,
      amount,
      nonce,
      this.circuitContext.currentPrivateState.shieldedNoteSecret,
      this.circuitContext.currentPrivateState.shieldedNoteValue,
    );
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getCurrentRun(): PayrollRun | null {
    const l = this.getLedger();
    if (l.hasActiveRun === 0n) return null;
    return l.currentRun;
  }

  public getShieldedPool(): ShieldedPool | null {
    const l = this.getLedger();
    // ShieldedPool is always present but has zero values initially
    if (l.shieldedPool.value === 0n && l.shieldedPool.noteCommitment.every(b => b === 0)) {
      return null;
    }
    return l.shieldedPool;
  }

  public getNullifierCount(): number {
    const l = this.getLedger();
    return Number(l.nullifierCount);
  }

  public getPrivateState(): PayrollPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  // Employer creates a payroll run
  public createPayrollRun(merkleRoot: Uint8Array, totalCommitted: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.createPayrollRun(
      this.circuitContext,
      merkleRoot,
      totalCommitted,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  // Employer funds the payroll
  public fundPayroll(noteCommitment: Uint8Array, value: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.fundPayroll(
      this.circuitContext,
      noteCommitment,
      value,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  // Employee withdraws
  public withdraw(
    proof: any,
  ): Ledger {
    this.circuitContext = this.contract.impureCircuits.withdraw(
      this.circuitContext,
      proof,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  // Employer finalizes
  public finalizePayroll(): Ledger {
    this.circuitContext = this.contract.impureCircuits.finalizePayroll(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  // Pure circuits
  public static publicKey(secretKey: Uint8Array): Uint8Array {
    return pureCircuits.publicKey(secretKey);
  }

  public static computeCommitment(pubkey: Uint8Array, amount: Uint8Array, nonce: Uint8Array): Uint8Array {
    return pureCircuits.computeCommitment(pubkey, amount, nonce);
  }

  public static computeNullifier(commitment: Uint8Array, secret: Uint8Array): Uint8Array {
    return pureCircuits.computeNullifier(commitment, secret);
  }

  public static verifyMerkleProof(root: Uint8Array, proof: any): boolean {
    return pureCircuits.verifyMerkleProof(root, proof);
  }

  public static verifyWithdrawalProof(merkleRoot: Uint8Array, proof: any): boolean {
    return pureCircuits.verifyWithdrawalProof(merkleRoot, proof);
  }
}

// Helper to convert bigint to 32-byte array (padded)
export function bigintToBytes32(value: bigint): Uint8Array {
  const bytes = new Uint8Array(32);
  let val = value;
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(val & 0xffn);
    val = val >> 8n;
  }
  return bytes;
}

// Simple Merkle tree for testing
class TestMerkleTree {
  leaves: Uint8Array[];
  tree: Uint8Array[][];

  constructor(leaves: Uint8Array[]) {
    this.leaves = leaves;
    this.tree = this.buildTree(leaves);
  }

  private hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
    const combined = new Uint8Array(left.length + right.length);
    combined.set(left);
    combined.set(right, left.length);
    // Simplified hash
    return new Uint8Array(32);
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

    return { leaf, path, indices };
  }
}