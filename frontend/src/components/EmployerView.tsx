import { useState, useMemo } from "react";
import { usePayroll } from "../hooks/usePayroll";
import { toHex } from "@midnight-ntwrk/midnight-js/utils";
import { derivePublicKeyFromAddress } from "../midnight/payrollContract";

interface Employee {
  name: string;
  walletAddress: string;
  amount: string; // string for input, converted to bigint
  nonce: string;
}

const generateNonce = (): string => {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
};

export const EmployerView = () => {
  const {
    ledgerState,
    busy,
    error,
    employerCreatePayrollRun,
    employerFinalizePayroll,
    publicKey,
    wallet,
    hasContract,
  } = usePayroll();

  const [employees, setEmployees] = useState<Employee[]>([
    { name: "Alice", walletAddress: "", amount: "50000", nonce: generateNonce() },
    { name: "Bob", walletAddress: "", amount: "60000", nonce: generateNonce() },
    { name: "Carol", walletAddress: "", amount: "55000", nonce: generateNonce() },
  ]);
  const [totalAmount, setTotalAmount] = useState<string>("");

  const totalCommitted = useMemo(() => {
    return employees.reduce((sum, emp) => sum + BigInt(emp.amount || "0"), 0n);
  }, [employees]);

  const activeRun = useMemo(() => {
    return ledgerState?.payrollRuns.find((r) => r.isActive && !r.isFinalized);
  }, [ledgerState]);

  const allAddressesFilled = employees.every((emp) => emp.walletAddress.trim().length > 0);

  const handleEmployeeChange = (index: number, field: keyof Employee, value: string) => {
    setEmployees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      { name: `Employee ${prev.length + 1}`, walletAddress: "", amount: "0", nonce: generateNonce() },
    ]);
  };

  const removeEmployee = (index: number) => {
    if (employees.length <= 1) return;
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePayroll = async () => {
    // Each employee's pubkey is derived straight from their wallet address —
    // no separate registration step needed. Whoever connects with that same
    // wallet later derives the identical value (see payrollContract.ts).
    const employeeData = await Promise.all(
      employees.map(async (emp) => ({
        pubkey: await derivePublicKeyFromAddress(emp.walletAddress),
        amount: BigInt(emp.amount || "0"),
        nonce: emp.nonce,
      })),
    );

    await employerCreatePayrollRun(employeeData, totalCommitted);
  };

  const handleFinalize = async (runId: bigint) => {
    await employerFinalizePayroll(runId);
  };

  return (
    <div className="employer-view">
      <h2>Employer dashboard</h2>

      {publicKey && (
        <div className="pubkey-display">
          <strong>Your Public Key:</strong> <code>{publicKey.slice(0, 16)}…</code>
        </div>
      )}

      {error && <div className="error-strip">{error}</div>}

      <div className="section">
        <h3>Payroll Employees</h3>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Wallet Address</th>
              <th>Salary</th>
              <th>Nonce (auto)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="text"
                    value={emp.name}
                    onChange={(e) => handleEmployeeChange(idx, "name", e.target.value)}
                    placeholder="Employee name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={emp.walletAddress}
                    onChange={(e) => handleEmployeeChange(idx, "walletAddress", e.target.value)}
                    placeholder="Employee's unshielded wallet address"
                  />
                  {!emp.walletAddress && wallet?.unshieldedAddress && (
                    <button
                      className="small-btn"
                      onClick={() => handleEmployeeChange(idx, "walletAddress", wallet.unshieldedAddress)}
                    >
                      Use Mine
                    </button>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={emp.amount}
                    onChange={(e) => handleEmployeeChange(idx, "amount", e.target.value)}
                    min="0"
                    step="1000"
                  />
                </td>
                <td><code>{emp.nonce.slice(0, 12)}…</code></td>
                <td>
                  <button className="small-btn danger" onClick={() => removeEmployee(idx)} disabled={employees.length <= 1}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-btn" onClick={addEmployee}>+ Add Employee</button>
      </div>

      <div className="section">
        <h3>Payroll Summary</h3>
        <div className="summary-row">
          <span>Total Employees:</span>
          <strong>{employees.length}</strong>
        </div>
        <div className="summary-row">
          <span>Total Committed:</span>
          <strong>{totalCommitted.toLocaleString()}</strong>
        </div>
        <div className="summary-row">
          <span>Total Amount (override):</span>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder={totalCommitted.toString()}
            min="0"
            step="1000"
          />
        </div>
      </div>

      <div className="section actions">
        {!activeRun ? (
          <button
            className="primary-btn"
            onClick={handleCreatePayroll}
            disabled={!!busy || employees.length === 0 || totalCommitted === 0n || !allAddressesFilled}
          >
            {busy ? busy : "Create Payroll Run"}
          </button>
        ) : (
          <>
            <div className="active-run">
              <h4>Active Payroll Run #{activeRun.id.toString()}</h4>
              <div className="summary-row"><span>Merkle Root:</span> <code>{activeRun.merkleRoot.slice(0, 16)}…</code></div>
              <div className="summary-row"><span>Total:</span> <strong>{activeRun.totalCommitted.toLocaleString()}</strong></div>
              <div className="summary-row"><span>Status:</span> <span className="status active">Accepting withdrawals</span></div>
            </div>
            <button
              className="secondary-btn"
              onClick={() => handleFinalize(activeRun.id)}
              disabled={!!busy}
            >
              {busy ? busy : "Finalize Payroll"}
            </button>
          </>
        )}
      </div>

      {ledgerState?.payrollRuns.length && (
        <div className="section">
          <h3>Payroll History</h3>
          <ul className="run-list">
            {ledgerState.payrollRuns.map((run) => (
              <li key={run.id.toString()} className={run.isFinalized ? "finalized" : "active"}>
                <span>Run #{run.id.toString()}</span>
                <span>{run.totalCommitted.toLocaleString()} — {run.isFinalized ? "Finalized" : run.isActive ? "Active" : "Closed"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
