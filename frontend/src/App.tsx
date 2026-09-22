import { usePayroll } from "./hooks/usePayroll";
import { WalletBar } from "./components/WalletBar";
import { RoleSelector } from "./components/RoleSelector";
import { EmployerView } from "./components/EmployerView";
import { EmployeeView } from "./components/EmployeeView";
import "./App.css";

export const App = () => {
  const m = usePayroll();

  return (
    <div className="board">
      <WalletBar
        isConnected={m.isConnected}
        wallet={m.wallet}
        busy={m.busy}
        onConnect={m.connect}
        onDisconnect={m.disconnect}
      />

      {m.error && <p className="error-strip">{m.error}</p>}

      {!m.isConnected ? (
        <div className="intro">
          <h2>Pay a team without publishing who's on it</h2>
          <p>Connect your Lace wallet to fund a payroll run or withdraw your salary.</p>
          <ul>
            <li>Employers fund a run behind a single committed total</li>
            <li>Employees withdraw with a proof, not a name</li>
            <li>The chain only ever sees a root, a total, and a count</li>
          </ul>
        </div>
      ) : (
        <>
          {m.hasContract && <RoleSelector />}
          
          {m.role === "employer" && <EmployerView />}
          {m.role === "employee" && <EmployeeView />}
          
          {!m.role && m.hasContract && (
            <div className="intro">
              <p>Select a role above to continue.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};