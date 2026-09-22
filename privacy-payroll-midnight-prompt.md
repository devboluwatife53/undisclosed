# Build Prompt: Privacy Payroll Protocol on Midnight Network

Use this as a starting prompt for Claude Code, another AI coding tool, or as a project spec.

---

## Prompt

Build a privacy-preserving payroll protocol on Midnight Network. The goal: employers pay employees on-chain without exposing salaries, employee identities, or payment history to the public ledger, while still allowing verifiable compliance (proof of payment, proof of tax withholding, proof of correct total payout) without revealing the underlying numbers.

### Core requirements

1. **Actors**
   - Employer (funds payroll, defines pay schedule and amounts)
   - Employee (receives pay, proves eligibility/identity claims without exposing them)
   - Optional: Auditor/Compliance role that can verify aggregate claims (e.g. "total tax withheld = X") without seeing individual salaries

2. **Privacy properties (using Midnight's shielded state + ZK proofs)**
   - Individual salary amounts are never exposed on-chain
   - Employee identity is not linkable to a specific payment on public state
   - Employer can prove total payroll spend for a period without revealing the per-employee breakdown
   - Employees can prove income (e.g. "I earned over threshold X last quarter") to a third party without revealing exact salary, using selective disclosure

3. **Contract logic (Compact)**
   - Payroll registration: employer defines a pay run with a committed total amount (hash/commitment, not plaintext)
   - Per-employee payment: employee submits a ZK proof they are a valid registered payee; contract releases funds without revealing which committed slot they correspond to
   - Withholding/tax proof: contract can emit a proof that withholding was calculated correctly (e.g. percentage of salary) without revealing the salary itself
   - Dispute/audit path: a designated auditor key can decrypt or verify specific claims under a selective-disclosure scheme, but this should be scoped and logged

4. **Minimal viable version (build this first)**
   - Single employer, fixed list of employees, single pay run
   - Employer deposits total payroll amount as a shielded commitment
   - Each employee proves membership in the payroll list and withdraws their (private) allocated amount
   - No recurring schedules, no tax logic, no auditor role yet

5. **Stack**
   - Smart contract: Compact (Midnight's contract language)
   - Off-chain proof generation: Midnight's ZK toolkit / proof server
   - Frontend: React (wallet connect for employer and employee roles)
   - Backend (if needed for scheduling/notifications): keep any off-chain server stateless with respect to salary data — it should never see plaintext amounts

6. **Explicitly out of scope for v1**
   - Multi-currency payroll
   - Recurring/automated pay runs
   - Full tax compliance logic (model it as a placeholder proof for now)
   - Cross-chain settlement

### Deliverables requested

- Compact contract(s) for the minimal viable version above, with comments explaining what each proof hides and what it reveals
- A short design doc: what is public on-chain, what is private, and what an outside observer of the chain can and cannot learn
- A basic React frontend: employer view (fund + register employees) and employee view (prove eligibility + withdraw)
- Test cases that specifically verify the privacy property (e.g. a test that confirms salary amounts are not recoverable from on-chain state)

Ask clarifying questions before writing code if the employee registration mechanism (how employees get added to the private payroll list) isn't clear from context.
