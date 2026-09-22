import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type EmployeeCommitment = { commitment: Uint8Array;
                                   pubkeyHash: Uint8Array
                                 };

export type MerkleProof = { leaf: Uint8Array;
                            path0: Uint8Array;
                            path1: Uint8Array;
                            path2: Uint8Array;
                            path3: Uint8Array;
                            indices: Uint8Array
                          };

export type WithdrawalProof = { merkleProof: MerkleProof;
                                nullifier: Uint8Array;
                                amount: Uint8Array;
                                pubkey: Uint8Array;
                                nonce: Uint8Array
                              };

export type PayrollRun = { id: bigint;
                           employer: Uint8Array;
                           merkleRoot: Uint8Array;
                           totalCommitted: bigint;
                           isActive: bigint;
                           isFinalized: bigint
                         };

export type ShieldedPool = { noteCommitment: Uint8Array;
                             value: bigint;
                             isSpent: bigint
                           };

export type Witnesses<PS> = {
  employerSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createPayrollRun(context: __compactRuntime.CircuitContext<PS>,
                   merkleRoot_0: Uint8Array,
                   totalCommitted_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundPayroll(context: __compactRuntime.CircuitContext<PS>,
              noteCommitment_0: Uint8Array,
              value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           proof_0: WithdrawalProof): __compactRuntime.CircuitResults<PS, []>;
  finalizePayroll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getCurrentRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, PayrollRun>;
  hasActivePayrollRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getNullifierCount(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getShieldedPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, ShieldedPool>;
  getPayrollCounter(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  createPayrollRun(context: __compactRuntime.CircuitContext<PS>,
                   merkleRoot_0: Uint8Array,
                   totalCommitted_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundPayroll(context: __compactRuntime.CircuitContext<PS>,
              noteCommitment_0: Uint8Array,
              value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           proof_0: WithdrawalProof): __compactRuntime.CircuitResults<PS, []>;
  finalizePayroll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getCurrentRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, PayrollRun>;
  hasActivePayrollRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getNullifierCount(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getShieldedPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, ShieldedPool>;
  getPayrollCounter(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
  computeCommitment(pubkey_0: Uint8Array,
                    amount_0: Uint8Array,
                    nonce_0: Uint8Array): Uint8Array;
  computeNullifier(commitment_0: Uint8Array, secret_0: Uint8Array): Uint8Array;
  verifyMerkleProof(root_0: Uint8Array, proof_0: MerkleProof): boolean;
  verifyWithdrawalProof(merkleRoot_0: Uint8Array, proof_0: WithdrawalProof): boolean;
  computeShieldedCommitment(value_0: Uint8Array, secret_0: Uint8Array): Uint8Array;
  verifyShieldedOpening(commitment_0: Uint8Array,
                        value_0: Uint8Array,
                        secret_0: Uint8Array): boolean;
  publicKey(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  computeCommitment(context: __compactRuntime.CircuitContext<PS>,
                    pubkey_0: Uint8Array,
                    amount_0: Uint8Array,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  computeNullifier(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array,
                   secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifyMerkleProof(context: __compactRuntime.CircuitContext<PS>,
                    root_0: Uint8Array,
                    proof_0: MerkleProof): __compactRuntime.CircuitResults<PS, boolean>;
  verifyWithdrawalProof(context: __compactRuntime.CircuitContext<PS>,
                        merkleRoot_0: Uint8Array,
                        proof_0: WithdrawalProof): __compactRuntime.CircuitResults<PS, boolean>;
  computeShieldedCommitment(context: __compactRuntime.CircuitContext<PS>,
                            value_0: Uint8Array,
                            secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifyShieldedOpening(context: __compactRuntime.CircuitContext<PS>,
                        commitment_0: Uint8Array,
                        value_0: Uint8Array,
                        secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  createPayrollRun(context: __compactRuntime.CircuitContext<PS>,
                   merkleRoot_0: Uint8Array,
                   totalCommitted_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fundPayroll(context: __compactRuntime.CircuitContext<PS>,
              noteCommitment_0: Uint8Array,
              value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           proof_0: WithdrawalProof): __compactRuntime.CircuitResults<PS, []>;
  finalizePayroll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  getCurrentRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, PayrollRun>;
  hasActivePayrollRun(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getNullifierCount(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getShieldedPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, ShieldedPool>;
  getPayrollCounter(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly nullifierCount: bigint;
  readonly payrollCounter: bigint;
  readonly currentRun: PayrollRun;
  readonly hasActiveRun: bigint;
  readonly shieldedPool: ShieldedPool;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
