import { useState, useMemo } from "react";
import { usePayroll } from "../hooks/usePayroll";
import { toHex, fromHex } from "@midnight-ntwrk/midnight-js/utils";

interface EmployeeRegistration {
  employerPubkey: string;
  employeeName: string;
  amount: string;
  nonce: string;
}

const generateNonce = (): string => {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
};

export const EmployeeView = () => {
  const {
    ledgerState,
    busy,
    error,
    employeeWithdraw,
    publicKey,
    identitySecretKeyHex,
    hasContract,
  } = usePayroll();

  const [registration, setRegistration] = useState<EmployeeRegistration>({
    employerPubkey: "",
    employeeName: "",
    amount: "0",
    nonce: generateNonce(),
  });
  const [registered, setRegistered] = useState<EmployeeRegistration | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string>("");

  const activeRuns = useMemo(() => {
    return ledgerState?.payrollRuns.filter((r) => r.isActive && !r.isFinalized) || [];
  }, [ledgerState]);

  const handleRegister = () => {
    if (!registration.employerPubkey || !registration.employeeName || !registration.amount) return;
    setRegistered({ ...registration });
  };

  const handleWithdraw = async () => {
    if (!registered || !selectedRunId) return;

    // In a real implementation, the employee would:
    // 1. Get the Merkle leaves from the employer (off-chain)
    // 2. Know their index in the tree
    // 3. Generate the ZK proof
    // For demo, we simulate this
    
    const runId = BigInt(selectedRunId);
    const employeeData = {
      pubkey: publicKey || "",
      amount: BigInt(registered.amount),
      nonce: registered.nonce,
      index: 0, // Would be their actual index
      merkleLeaves: [], // Would be provided by employer off-chain
    };

    await employeeWithdraw(runId, employeeData);
  };

  const canWithdraw = registered && selectedRunId && !busy;

  return (
    <div className="employee-view">
      <h2>Employee portal</h2>
      
      {publicKey && (
        <div className="pubkey-display">
          <strong>Your Public Key:</strong> <code>{publicKey.slice(0, 16)}…</code>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(publicKey)}>
            Copy
          </button>
        </div>
      )}

      {error && <div className="error-strip">{error}</div>}

      {!registered ? (
        <div className="section">
          <h3>Register for Payroll</h3>
          <p>Enter the employer's public key and your salary details to register.</p>
          
          <div className="form-group">
            <label>Employer Public Key</label>
            <input
              type="text"
              value={registration.employerPubkey}
              onChange={(e) => setRegistration({ ...registration, employerPubkey: e.target.value })}
              placeholder="Employer's public key"
            />
          </div>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={registration.employeeName}
              onChange={(e) => setRegistration({ ...registration, employeeName: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Salary Amount</label>
            <input
              type="number"
              value={registration.amount}
              onChange={(e) => setRegistration({ ...registration, amount: e.target.value })}
              min="0"
              step="1000"
            />
          </div>

          <div className="form-group">
            <label>Nonce (auto-generated)</label>
            <input
              type="text"
              value={registration.nonce}
              readOnly
            />
            <button className="small-btn" onClick={() => setRegistration({ ...registration, nonce: generateNonce() })}>
              Regenerate
            </button>
          </div>

          <button
            className="primary-btn"
            onClick={handleRegister}
            disabled={!!busy || !registration.employerPubkey || !registration.employeeName}
          >
            {busy ? "Registering..." : "Register for Payroll"}
          </button>
        </div>
      ) : (
        <>
          <div className="section registered">
            <h3>Registered</h3>
            <div className="summary-row"><span>Name:</span> <strong>{registered.employeeName}</strong></div>
            <div className="summary-row"><span>Employer:</span> <code>{registered.employerPubkey.slice(0, 16)}…</code></div>
            <div className="summary-row"><span>Salary:</span> <strong>{registered.amount}</strong></div>
            <div className="summary-row"><span>Nonce:</span> <code>{registered.nonce.slice(0, 16)}…</code></div>
            <p className="privacy-note">
              Your salary and identity are committed to the employer's Merkle tree off-chain.
              Only the Merkle root is on-chain — no one can link you to your payment.
            </p>
          </div>

          {activeRuns.length > 0 && (
            <div className="section">
              <h3>Available Payroll Runs</h3>
              <div className="form-group">
                <label>Select Payroll Run</label>
                <select
                  value={selectedRunId}
                  onChange={(e) => setSelectedRunId(e.target.value)}
                >
                  <option value="">Choose a payroll run...</option>
                  {activeRuns.map((run) => (
                    <option key={run.id.toString()} value={run.id.toString()}>
                      Run #{run.id.toString()} — {run.totalCommitted.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="primary-btn"
                onClick={handleWithdraw}
                disabled={!canWithdraw}
              >
                {busy ? "Withdrawing..." : "Withdraw Salary (ZK Proof)"}
              </button>

              <p className="privacy-note">
                Withdrawal uses a ZK proof showing you're in the Merkle tree without revealing
                which leaf or your salary amount. A nullifier prevents double-spending.
              </p>
            </div>
          )}

          {activeRuns.length === 0 && (
            <div className="section empty">
              <p>No active payroll runs available. Check back after your employer creates a payroll run.</p>
            </div>
          )}
        </>
      )}

      {ledgerState && (
        <div className="section">
          <h3>On-Chain State (Public)</h3>
          <div className="summary-row"><span>Total Payroll Runs:</span> <strong>{ledgerState.payrollRuns.length}</strong></div>
          <div className="summary-row"><span>Shielded Pool:</span> {ledgerState.shieldedPool ? (
            <>
              <code>{ledgerState.shieldedPool.noteCommitment.slice(0, 16)}…</code>
              <span> Value: {ledgerState.shieldedPool.value.toLocaleString()}</span>
            </>
          ) : "Not funded"}</div>
          <div className="summary-row"><span>Withdrawals (nullifiers):</span> <strong>{ledgerState.nullifierCount.toString()}</strong></div>
        </div>
      )}
    </div>
  );
};