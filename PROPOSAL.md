# Undisclosed — Project Proposal

## 1. Product & Users

**What is Undisclosed?**
Undisclosed is a payroll protocol on Midnight where an employer funds a pay run with a single shielded commitment and each employee withdraws their own allocation by proving membership in the payroll set — without the employer's total, the employee list, individual salaries, or the mapping between employees and payments ever appearing in plaintext on the public ledger.

**Target users**
- Employers (DAOs, remote-first companies, contractor networks) who want to pay a team on-chain without publishing everyone's salary to a public ledger.
- Employees who want cryptographic proof they were paid correctly without exposing their income to anyone watching the chain.
- Developers learning Compact who need a reference contract for commitment schemes, Merkle membership proofs, and nullifiers — the three primitives that show up in almost every private-payments design.

**User journey**
1. Employer builds the employee set off-chain: for each employee, generate a nonce and compute `commitment = Hash(pubkey || amount || nonce)`, then assemble a Merkle tree from the commitments.
2. Employer calls `createPayrollRun(merkleRoot, totalCommitted)` — only the root and the total are published.
3. Employer calls `fundPayroll(noteCommitment, value)` to move the payroll total into a shielded pool.
4. Each employee independently generates a Merkle proof for their own leaf, derives a nullifier, and calls `withdraw(proof)` — the contract verifies the ZK proof and marks the nullifier spent, without learning which employee it was or how much they received.
5. Employer calls `finalizePayroll()` to close the run once withdrawals are done.

---

## 2. Why Midnight?

**Core property demonstrated: prove membership and correctness without disclosing the underlying data**
- Employee identity (`pubkey`) and salary (`amount`) are witness-only values, supplied to the `withdraw` circuit as private inputs and never written to the ledger.
- The only values disclosed are: the Merkle root, the total committed amount, and a nullifier per withdrawal — none of which reveal who is in the payroll or what any individual was paid.
- The compiler enforces this boundary the same way as Midnight's other privacy guarantees: witness values can only reach the ledger through an explicit `disclose()`.

**Commitment + nullifier pattern**
- `computeCommitment(pubkey, amount, nonce)` hides both identity and salary behind a single hash.
- `computeNullifier(commitment, secret)` is designed to let an employee spend their allocation exactly once without linking the spend back to their commitment — the standard shielded-pool double-spend pattern.

**Compact language fit**
- The contract (`payroll.compact`) is under 270 lines and walks through registration, funding, withdrawal, and finalization as four `export circuit`s, each with comments on what it hides and what it reveals — useful as a teaching example of the public/private split.

---

## 3. Public vs. Private Data Model

| Layer | What lives here | Example |
|-------|----------------|---------|
| **Public ledger state** (`export ledger`) | `currentRun: PayrollRun`, `shieldedPool: ShieldedPool`, `nullifierCount: Counter`, `payrollCounter: Counter` | `merkleRoot`, `totalCommitted`, pool `value`, run/pool status flags, count of withdrawals |
| **Private witness state** (`witness`) | `employerSecretKey()`, `employeeSecretKey()`, `employeeAmount()`, `employeeNonce()`, `shieldedNoteSecret()`, `shieldedNoteValue()` | Never written to chain — supplied per-call as private circuit inputs |
| **Circuits** | `createPayrollRun`, `fundPayroll`, `withdraw`, `finalizePayroll` | Mutate ledger state; disclose only roots/totals/nullifiers |
| **Pure circuits** | `computeCommitment`, `computeNullifier`, `verifyMerkleProof`, `verifyWithdrawalProof`, `verifyShieldedOpening`, `publicKey` | No ledger writes — reusable proof logic |

**What an outside observer can learn:** an employer created a run, the total committed, the Merkle root, that some number of withdrawals happened (nullifier count), and when the run was finalized.

**What an outside observer cannot learn:** who is in the payroll, individual salaries, which employee made which withdrawal, or the employee-to-amount mapping. Full breakdown in `DESIGN.md`.

---

## 4. Current Implementation Status (Honest Gaps)

This is an MVP. Two things in the current contract are stubs, not yet production logic — called out here rather than glossed over:

| Area | Status | Work needed |
|------|--------|--------------|
| **Merkle proof verification** | Stubbed — `verifyMerkleProof` currently just checks `proof.leaf == root`, ignoring the sibling path fields entirely | Implement real path-hashing verification so the tree supports more than one leaf |
| **Nullifier double-spend check** | Disabled — the `assert(!nullifiers.contains(...))` check is commented out in `withdraw()`, and `nullifierCount` is a counter, not a set | Replace with real Set-based nullifier storage and re-enable the assertion |
| **Fund transfer on withdrawal** | Not implemented — `withdraw()` verifies the proof and increments a counter, but no shielded value actually moves | Wire up Midnight Zswap shielded transfer so withdrawal also pays out |
| **Tax/withholding proofs, auditor role, recurring runs, multi-currency** | Out of scope by design for v1 | Deferred to future extensions per `DESIGN.md` |

---

## 5. Mainnet Feasibility

**What works today**
- Contract compiles against Compact `0.31.1`.
- Registration → funding → withdrawal → finalization flow is implemented end-to-end for a single-employee tree.
- Test suite (`payroll.test.ts`, `payroll-simulator.ts`) exercises the flow via the in-memory simulator.
- Frontend has role-based views (`EmployerView`, `EmployeeView`) wired to the contract via `usePayroll`.

**Gaps to close for Mainnet**
| Area | Status | Work needed |
|------|--------|--------------|
| **Merkle tree** | Single-leaf stub | Real multi-employee tree verification (see above) |
| **Nullifier set** | Disabled check | Real Set-backed nullifier storage |
| **Shielded transfer** | Not implemented | Actual Zswap payout on withdrawal |
| **Audit** | Not started | Formal audit of contract + circuits once the above are real |
| **Key management UX** | Manual | Seed import/export, hardware wallet support |
| **Indexer / explorer integration** | Not built | Production indexer for run/withdrawal history |
| **Auditor/compliance role** | Not built | Selective-disclosure verification path (see `DESIGN.md` future extensions) |
| **Network stability** | Untested beyond local simulator | Validate on Preview/Preprod, then Mainnet |

**Conclusion**
Undisclosed demonstrates the core privacy pattern for on-chain payroll — commitment-based registration, ZK membership proofs, and nullifiers — as a working Compact contract with matching tests and a role-based frontend. The two remaining stubs (real Merkle verification and an enforced nullifier set) are well-scoped next steps before this is safe for more than a single-employee demo.
