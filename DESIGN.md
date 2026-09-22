# Undisclosed — Privacy-Preserving Payroll Protocol Design Document

## Overview
This protocol enables employers to pay employees on-chain without exposing salaries, employee identities, or payment history to the public ledger, while allowing verifiable compliance proofs.

---

## Actors
- **Employer**: Funds payroll, defines pay run with committed total amount
- **Employee**: Receives pay, proves eligibility without exposing identity/salary
- **Auditor (future)**: Can verify aggregate claims under selective disclosure

---

## Privacy Properties

| Property | Mechanism |
|----------|-----------|
| Individual salaries never exposed | Pederson commitments + ZK proofs |
| Employee identity not linkable to payment | Merkle tree membership + nullifiers |
| Employer proves total spend without breakdown | Single shielded pool + commitment to total |
| Employee proves income threshold | Selective disclosure via ZK range proofs |

---

## On-Chain Public State

```
PayrollRun {
  id: u64                    // Payroll run identifier
  employer: Bytes<32>        // Employer's public key (pseudonymous)
  merkleRoot: Bytes<32>      // Root of employee commitment tree
  totalCommitted: u64        // Total payroll amount (public commitment)
  isActive: bool             // Whether withdrawals allowed
  isFinalized: bool          // Whether run is closed
}

ShieldedPool {
  noteCommitment: Bytes<32>  // Commitment to shielded note holding funds
  value: u64                 // Total value in pool (public)
  isSpent: bool              // Whether pool has been spent
}

Nullifiers: Set<Bytes<32>>   // Prevents double-spending
```

### What an Outside Observer CAN Learn:
- An employer (pseudonymous) created a payroll run
- The total committed payroll amount
- The Merkle root of the employee commitment tree
- That *some* employees withdrew (nullifiers appear)
- The number of withdrawals (nullifier count)
- When the payroll was finalized

### What an Outside Observer CANNOT Learn:
- Which employees are in the payroll
- Individual salary amounts
- Which employee made which withdrawal
- The mapping between employees and amounts
- Whether a specific person is an employee
- The exact amounts withdrawn (only nullifiers are public)

---

## Off-Chain Private Data (Never On-Chain)

### Employer Side:
- Employee public keys
- Individual salary amounts
- Nonces for each commitment
- Merkle tree construction (leaves, intermediate nodes)
- Shielded note secret and value

### Employee Side:
- Their private key
- Their salary amount
- Their commitment nonce
- Nullifier secret (derived from nonce)

---

## Protocol Flow (MVP)

### 1. Registration (Off-Chain)
```
Employer:
  For each employee:
    - Generate random nonce
    - Compute commitment = Hash(pubkey || amount || nonce)
    - Compute pubkeyHash = Hash(pubkey)
  Build Merkle tree from all commitments
  Publish merkleRoot and totalCommitted on-chain via createPayrollRun()
```

### 2. Funding (On-Chain)
```
Employer:
  - Create shielded note with total payroll value
  - Submit noteCommitment and value via fundPayroll()
  - Funds now in shielded pool (Midnight Zswap)
```

### 3. Withdrawal (On-Chain + ZK Proof)
```
Employee (for their specific commitment):
  - Generate Merkle proof for their leaf
  - Compute nullifier = Hash(commitment || nonce)
  - Generate ZK proof (WithdrawalProof) showing:
      * Leaf is in Merkle tree (without revealing position)
      * They know preimage (pubkey, amount, nonce)
      * Nullifier is correctly derived
      * Nullifier not already used
  - Submit withdraw(runId, proof)
  - Contract verifies proof, marks nullifier used
  - Employee receives funds via shielded transfer (off-chain Zswap)
```

### 4. Finalization (On-Chain)
```
Employer:
  - Call finalizePayroll(runId)
  - No more withdrawals allowed
  - Remaining funds (if any) refunded to employer
```

---

## Cryptographic Primitives

| Primitive | Purpose |
|-----------|---------|
| `persistentHash` | Midnight's collision-resistant hash (Poseidon) |
| Merkle Tree | Employee set membership with O(log n) proofs |
| Nullifiers | Prevent double-spend without revealing identity |
| Pedersen Commitments | Hide amounts while allowing sum verification |
| ZK Proofs | Prove knowledge of preimage without revealing it |

---

## Trust Assumptions

1. **Employer is honest during registration**: Commits to correct amounts
2. **Employees keep secrets safe**: Private keys, nonces, amounts
3. **Midnight Zswap**: Provides shielded value transfer
4. **No trusted setup**: All proofs use transparent hash-based circuits

---

## Future Extensions (Out of Scope for MVP)

- **Tax withholding proofs**: ZK proof that `withheld = amount * rate`
- **Auditor role**: Designated key can decrypt specific commitments
- **Recurring payrolls**: Schedule multiple runs with same employee set
- **Income verification**: Employee proves `amount > threshold` via range proof
- **Multi-currency**: Separate shielded pools per currency

---

## Security Considerations

### Replay Protection
- Nullifiers prevent double-spending within a payroll run
- Each run has independent nullifier set

### Front-Running
- Withdrawals don't reveal amounts on-chain
- No MEV opportunity from salary information

### Employer Malfeasance
- Employer could underfund pool (caught by `value == totalCommitted` check)
- Employer could register fake employees (auditable via Merkle tree)
- Employees can verify their commitment is in the tree off-chain

### Employee Privacy
- Merkle proof hides position in tree
- Nullifier unlinkable to commitment without nonce
- Amount never appears in any public state

---

## On-Chain Data Minimization

| Data | On-Chain? | Reason |
|------|-----------|--------|
| Employer public key | Yes | Accountability |
| Merkle root | Yes | Commitment to employee set |
| Total committed | Yes | Verifiable total spend |
| Individual commitments | No | Would leak salaries |
| Employee public keys | No | Would link identity to payments |
| Salary amounts | No | Core privacy requirement |
| Withdrawal amounts | No | Only nullifiers public |
| Employee-to-payment links | No | Nullifiers break linkability |

---

## Compliance Verification (Future)

Auditor with designated key can:
1. Request selective disclosure from employer/employees
2. Verify `sum(withheld) == totalCommitted * taxRate` via ZK proof
3. Verify individual `withheld_i == amount_i * taxRate` without learning `amount_i`
4. All verified on-chain without revealing private data