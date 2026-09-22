import { usePayroll } from "../hooks/usePayroll";

export const RoleSelector = () => {
  const { role, setRole, hasContract, isConnected } = usePayroll();

  if (!isConnected || !hasContract) return null;

  return (
    <div className="role-selector">
      <h3>You are</h3>
      <div className="role-buttons">
        <button
          className={role === "employer" ? "active" : ""}
          onClick={() => setRole("employer")}
        >
          Employer
        </button>
        <button
          className={role === "employee" ? "active" : ""}
          onClick={() => setRole("employee")}
        >
          Employee
        </button>
      </div>
    </div>
  );
};