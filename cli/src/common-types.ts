import { Payroll, type PayrollPrivateState } from "@undisclosed/contract";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js/types";
import type {
  DeployedContract,
  FoundContract,
} from "@midnight-ntwrk/midnight-js/contracts";
import type { ProvableCircuitId } from "@midnight-ntwrk/compact-js";

export type PayrollCircuits = ProvableCircuitId<
  Payroll.Contract<PayrollPrivateState>
>;

export const PayrollPrivateStateId = "payrollPrivateState";

export type PayrollProviders = MidnightProviders<
  PayrollCircuits,
  typeof PayrollPrivateStateId,
  PayrollPrivateState
>;

export type PayrollContract = Payroll.Contract<PayrollPrivateState>;

export type DeployedPayrollContract =
  | DeployedContract<PayrollContract>
  | FoundContract<PayrollContract>;
