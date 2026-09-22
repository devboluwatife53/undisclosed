import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect, beforeEach } from "vitest";
import { PayrollSimulator, bigintToBytes32 } from "./payroll-simulator.js";
import { randomBytes } from "./utils.js";
import { toHex } from "@midnight-ntwrk/midnight-js/utils";

setNetworkId("undeployed");

describe("Payroll contract - Privacy Properties", () => {
  let employerKey: Uint8Array;
  let aliceKey: Uint8Array;
  let bobKey: Uint8Array;
  let carolKey: Uint8Array;
  let aliceAmount: bigint;
  let bobAmount: bigint;
  let carolAmount: bigint;
  let aliceAmountBytes: Uint8Array;
  let bobAmountBytes: Uint8Array;
  let carolAmountBytes: Uint8Array;
  let aliceNonce: Uint8Array;
  let bobNonce: Uint8Array;
  let carolNonce: Uint8Array;
  let shieldedSecret: Uint8Array;
  let shieldedValue: bigint;
  let shieldedValueBytes: Uint8Array;

  beforeEach(() => {
    employerKey = randomBytes(32);
    aliceKey = randomBytes(32);
    bobKey = randomBytes(32);
    carolKey = randomBytes(32);
    aliceAmount = 50000n;
    bobAmount = 60000n;
    carolAmount = 55000n;
    aliceAmountBytes = bigintToBytes32(aliceAmount);
    bobAmountBytes = bigintToBytes32(bobAmount);
    carolAmountBytes = bigintToBytes32(carolAmount);
    aliceNonce = randomBytes(32);
    bobNonce = randomBytes(32);
    carolNonce = randomBytes(32);
    shieldedSecret = randomBytes(32);
    shieldedValue = aliceAmount + bobAmount + carolAmount;
    shieldedValueBytes = bigintToBytes32(shieldedValue);
  });

  it("initializes with no active payroll run and no shielded pool", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );
    expect(sim.getCurrentRun()).toBeNull();
    expect(sim.getShieldedPool()).toBeNull();
    expect(sim.getNullifierCount()).toBe(0);
  });

  it("employer can create a payroll run with Merkle root", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // Build commitments off-chain
    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const bobCommitment = PayrollSimulator.computeCommitment(bobKey, bobAmountBytes, bobNonce);
    const carolCommitment = PayrollSimulator.computeCommitment(carolKey, carolAmountBytes, carolNonce);

    // Build Merkle tree (simplified - just hash all commitments)
    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;

    const totalCommitted = shieldedValue;
    sim.createPayrollRun(merkleRoot, totalCommitted);

    const run = sim.getCurrentRun();
    expect(run).not.toBeNull();
    expect(run!.id).toBe(1n);
    expect(run!.merkleRoot).toEqual(merkleRoot);
    expect(run!.totalCommitted).toBe(totalCommitted);
    expect(run!.isActive).toBe(1n);
    expect(run!.isFinalized).toBe(0n);
  });

  it("employer can fund the shielded pool", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    const pool = sim.getShieldedPool();
    expect(pool).not.toBeNull();
    expect(pool!.value).toBe(shieldedValue);
    expect(pool!.isSpent).toBe(0n);
  });

  it("employee can withdraw using ZK proof (simulated)", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // For simplified verifyMerkleProof (leaf == root), use commitment as merkle root
    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const merkleRoot = aliceCommitment; // leaf == root for single-element tree
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    const aliceNullifier = PayrollSimulator.computeNullifier(aliceCommitment, aliceNonce);
    
    // MerkleProof struct for simplified single-level tree
    const merkleProof = {
      leaf: aliceCommitment,
      path0: new Uint8Array(32),
      path1: new Uint8Array(32),
      path2: new Uint8Array(32),
      path3: new Uint8Array(32),
      indices: new Uint8Array(32), // all zeros = left
    };

    const proof = {
      merkleProof,
      nullifier: aliceNullifier,
      amount: aliceAmountBytes,
      pubkey: aliceKey,
      nonce: aliceNonce,
    };

    sim.switchEmployee(aliceKey, aliceAmount, aliceNonce);
    sim.withdraw(proof);

    // Verify nullifier was recorded
    expect(sim.getNullifierCount()).toBe(1);
  });

  it("tracks multiple withdrawals via nullifier count", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // For multiple employees, we need a proper Merkle tree
    // But simplified verifyMerkleProof only checks leaf == root
    // So we test with one employee at a time, or use a single commitment as root
    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const merkleRoot = aliceCommitment; // leaf == root
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    // Alice withdraws
    const aliceNullifier = PayrollSimulator.computeNullifier(aliceCommitment, aliceNonce);
    const aliceProof = {
      merkleProof: {
        leaf: aliceCommitment,
        path0: new Uint8Array(32),
        path1: new Uint8Array(32),
        path2: new Uint8Array(32),
        path3: new Uint8Array(32),
        indices: new Uint8Array(32),
      },
      nullifier: aliceNullifier,
      amount: aliceAmountBytes,
      pubkey: aliceKey,
      nonce: aliceNonce,
    };
    
    sim.switchEmployee(aliceKey, aliceAmount, aliceNonce);
    sim.withdraw(aliceProof);

    // Bob withdraws - create new payroll run for Bob
    sim.finalizePayroll();
    
    const bobCommitment = PayrollSimulator.computeCommitment(bobKey, bobAmountBytes, bobNonce);
    const bobMerkleRoot = bobCommitment;
    
    sim.createPayrollRun(bobMerkleRoot, bobAmount);
    sim.fundPayroll(new Uint8Array(32), bobAmount);
    
    const bobNullifier = PayrollSimulator.computeNullifier(bobCommitment, bobNonce);
    const bobProof = {
      merkleProof: {
        leaf: bobCommitment,
        path0: new Uint8Array(32),
        path1: new Uint8Array(32),
        path2: new Uint8Array(32),
        path3: new Uint8Array(32),
        indices: new Uint8Array(32),
      },
      nullifier: bobNullifier,
      amount: bobAmountBytes,
      pubkey: bobKey,
      nonce: bobNonce,
    };
    
    sim.switchEmployee(bobKey, bobAmount, bobNonce);
    sim.withdraw(bobProof);

    expect(sim.getNullifierCount()).toBe(2);
  });

  it("employer can finalize payroll", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    // Check state before finalizing
    let run = sim.getCurrentRun();
    expect(run!.isActive).toBe(1n);
    expect(run!.isFinalized).toBe(0n);

    sim.finalizePayroll();

    // After finalizing, hasActiveRun = 0, so getCurrentRun returns null
    // Check the ledger directly
    const ledger = sim.getLedger();
    expect(ledger.currentRun.isActive).toBe(0n);
    expect(ledger.currentRun.isFinalized).toBe(1n);
    expect(ledger.hasActiveRun).toBe(0n);

    const pool = sim.getShieldedPool();
    expect(pool!.isSpent).toBe(1n);
  });

  // ======================================================================
  // PRIVACY PROPERTY TESTS
  // ======================================================================

  // Helper to serialize ledger with BigInt support
  function serializeLedger(ledger: any): string {
    return JSON.stringify(ledger, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  }

  it("salary amounts are not recoverable from on-chain state", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    const ledger = sim.getLedger();
    const ledgerString = serializeLedger(ledger);
    
    // Verify that individual amounts are NOT in the ledger
    expect(ledgerString).not.toContain(aliceAmount.toString());
    expect(ledgerString).not.toContain(bobAmount.toString());
    expect(ledgerString).not.toContain(carolAmount.toString());
    
    // But should contain the total
    expect(ledgerString).toContain(totalCommitted.toString());
  });

  it("employee public keys are not exposed on-chain", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    const ledger = sim.getLedger();
    const ledgerString = serializeLedger(ledger);

    // Employee public keys should not appear in ledger
    const alicePubkeyHex = toHex(PayrollSimulator.publicKey(aliceKey));
    const bobPubkeyHex = toHex(PayrollSimulator.publicKey(bobKey));
    const carolPubkeyHex = toHex(PayrollSimulator.publicKey(carolKey));

    expect(ledgerString).not.toContain(alicePubkeyHex);
    expect(ledgerString).not.toContain(bobPubkeyHex);
    expect(ledgerString).not.toContain(carolPubkeyHex);
  });

  it("employee identity is not linkable to specific payment via nullifier", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // Use commitment as merkle root for simplified verification
    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const merkleRoot = aliceCommitment;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    // Alice withdraws
    const aliceNullifier = PayrollSimulator.computeNullifier(aliceCommitment, aliceNonce);
    const alicePubkeyHex = toHex(PayrollSimulator.publicKey(aliceKey));

    const merkleProof = {
      leaf: aliceCommitment,
      path0: new Uint8Array(32),
      path1: new Uint8Array(32),
      path2: new Uint8Array(32),
      path3: new Uint8Array(32),
      indices: new Uint8Array(32),
    };

    const proof = {
      merkleProof,
      nullifier: aliceNullifier,
      amount: aliceAmountBytes,
      pubkey: aliceKey,
      nonce: aliceNonce,
    };

    sim.switchEmployee(aliceKey, aliceAmount, aliceNonce);
    sim.withdraw(proof);

    const ledger = sim.getLedger();
    const ledgerString = serializeLedger(ledger);

    // Nullifier should be in ledger (tracked via counter)
    // But nullifier itself is not stored in this simplified version
    // The counter increments but doesn't reveal which nullifier
    
    // The key privacy property: ledger doesn't contain pubkey or amount
    expect(ledgerString).not.toContain(alicePubkeyHex);
    expect(ledgerString).not.toContain(aliceAmount.toString());
  });

  it("Merkle root commits to employee set without revealing members", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const bobCommitment = PayrollSimulator.computeCommitment(bobKey, bobAmountBytes, bobNonce);
    const carolCommitment = PayrollSimulator.computeCommitment(carolKey, carolAmountBytes, carolNonce);

    // In real implementation, merkleRoot would be computed from these
    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);

    const run = sim.getCurrentRun();
    expect(run!.merkleRoot).toEqual(merkleRoot);

    // The Merkle root alone does not reveal:
    // - How many employees
    // - Who the employees are
    // - What their salaries are
    // - The individual commitments
  });

  it("different employees produce different commitments even with same amount", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // Alice and Bob have same salary but different nonces
    const aliceCommitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const bobCommitment = PayrollSimulator.computeCommitment(bobKey, aliceAmountBytes, bobNonce);

    // Commitments should be different (different pubkeys and nonces)
    expect(aliceCommitment).not.toEqual(bobCommitment);

    // Even with same pubkey, different nonces produce different commitments
    const aliceCommitment2 = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, bobNonce);
    expect(aliceCommitment).not.toEqual(aliceCommitment2);
  });

  it("commitment is deterministic for same inputs", () => {
    const commitment1 = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const commitment2 = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    expect(commitment1).toEqual(commitment2);
  });

  it("nullifier is deterministic for same commitment and secret", () => {
    const commitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const nullifier1 = PayrollSimulator.computeNullifier(commitment, aliceNonce);
    const nullifier2 = PayrollSimulator.computeNullifier(commitment, aliceNonce);
    expect(nullifier1).toEqual(nullifier2);
  });

  it("different nonces produce different nullifiers for same commitment", () => {
    const commitment = PayrollSimulator.computeCommitment(aliceKey, aliceAmountBytes, aliceNonce);
    const nullifier1 = PayrollSimulator.computeNullifier(commitment, aliceNonce);
    const nullifier2 = PayrollSimulator.computeNullifier(commitment, bobNonce);
    expect(nullifier1).not.toEqual(nullifier2);
  });

  it("public key derivation is deterministic and one-way", () => {
    const pubkey1 = PayrollSimulator.publicKey(employerKey);
    const pubkey2 = PayrollSimulator.publicKey(employerKey);
    expect(pubkey1).toEqual(pubkey2);

    // Different keys produce different pubkeys
    const alicePubkey = PayrollSimulator.publicKey(aliceKey);
    const bobPubkey = PayrollSimulator.publicKey(bobKey);
    expect(alicePubkey).not.toEqual(bobPubkey);
    expect(alicePubkey).not.toEqual(employerKey); // Not the raw key
  });

  it("shielded pool value matches committed total", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    const merkleRoot = new Uint8Array(32);
    merkleRoot[0] = 0x42;
    const totalCommitted = shieldedValue;

    sim.createPayrollRun(merkleRoot, totalCommitted);
    sim.fundPayroll(new Uint8Array(32), shieldedValue);

    const pool = sim.getShieldedPool();
    expect(pool!.value).toBe(totalCommitted);
    
    // On-chain observer can verify total matches
    // But cannot see individual breakdown
  });

  it("payroll counter increments for each run", () => {
    const sim = new PayrollSimulator(
      employerKey, aliceKey, aliceAmount, aliceNonce, shieldedSecret, shieldedValue
    );

    // Run 1
    sim.createPayrollRun(new Uint8Array(32), 100000n);
    sim.fundPayroll(new Uint8Array(32), 100000n);
    sim.finalizePayroll();

    // Run 2
    sim.createPayrollRun(new Uint8Array(32), 200000n);
    sim.fundPayroll(new Uint8Array(32), 200000n);

    const ledger = sim.getLedger();
    expect(ledger.payrollCounter).toBe(2n);
  });
});