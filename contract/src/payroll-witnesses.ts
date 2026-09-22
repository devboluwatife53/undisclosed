/*
 * Private state and witnesses for the payroll contract.
 * None of this ever touches the public ledger unless a circuit
 * explicitly calls disclose() on a value derived from it.
 */

import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from "./managed/payroll/contract/index.js";

export type PayrollPrivateState = {
  readonly employerSecretKey: Uint8Array;
  readonly employeeSecretKey: Uint8Array;
  readonly employeeAmount: bigint;
  readonly employeeNonce: Uint8Array;
  readonly shieldedNoteSecret: Uint8Array;
  readonly shieldedNoteValue: bigint;
};

export const createPayrollPrivateState = (
  employerSecretKey: Uint8Array,
  employeeSecretKey: Uint8Array,
  employeeAmount: bigint,
  employeeNonce: Uint8Array,
  shieldedNoteSecret: Uint8Array,
  shieldedNoteValue: bigint,
): PayrollPrivateState => ({
  employerSecretKey,
  employeeSecretKey,
  employeeAmount,
  employeeNonce,
  shieldedNoteSecret,
  shieldedNoteValue,
});

export const witnesses = {
  employerSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    Uint8Array,
  ] => [privateState, privateState.employerSecretKey],

  employeeSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    Uint8Array,
  ] => [privateState, privateState.employeeSecretKey],

  employeeAmount: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    bigint,
  ] => [privateState, privateState.employeeAmount],

  employeeNonce: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    Uint8Array,
  ] => [privateState, privateState.employeeNonce],

  shieldedNoteSecret: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    Uint8Array,
  ] => [privateState, privateState.shieldedNoteSecret],

  shieldedNoteValue: ({
    privateState,
  }: WitnessContext<Ledger, PayrollPrivateState>): [
    PayrollPrivateState,
    bigint,
  ] => [privateState, privateState.shieldedNoteValue],
};