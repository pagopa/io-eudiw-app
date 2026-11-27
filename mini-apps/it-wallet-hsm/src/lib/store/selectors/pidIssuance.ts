import { WalletCombinedRootState } from '..';

/**
 * Selects the instanceCreation async status.
 * @param state - The root state
 * @returns The instanceCreation async status
 */
export const selectInstanceStatus = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.instanceCreation;

/**
 * Selects the issuance async status.
 * @param state - The root state
 * @returns The issuance async status
 */
export const selectPidIssuanceStatus = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.issuance;

/**
 * Selects the issuance data if the status is success.
 * @param state - The root state
 * @returns The issuance data if the status is success, otherwise undefined
 */
export const selectPidIssuanceData = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.issuance.success.status === true
    ? state.hsm.pidIssuanceStatus.issuance.success.data
    : undefined;

/**
 * Selects the error occurred during the issuance flow, regardless of the phase
 * (OID4VCI issuance or vault persistence).
 * @param state - The root state
 * @returns The error occurred during the issuance flow
 */
export const selectPidIssuanceError = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.issuance.error.error;

/**
 * Selects the phase the issuance error originates from, when present.
 * @param state - The root state
 * @returns `'issuance'` or `'persist'` when an error is set, otherwise undefined
 */
export const selectPidIssuanceErrorType = (state: WalletCombinedRootState) => {
  const { error } = state.hsm.pidIssuanceStatus.issuance;
  return error.status ? error.type : undefined;
};

/**
 * Selects whether the PID obtained by the current issuance flow has been stored.
 * @param state - The root state
 * @returns true if the PID has been stored, false otherwise
 */
export const selectIsPidIssuanceStored = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.isPidStored;

/**
 * Selects the pending credential to issue after the Wallet Pid has been obtained
 * @param state - The root state
 * @returns The credential to issue after the wallet is operational
 */
export const selectPendingCredential = (state: WalletCombinedRootState) =>
  state.hsm.pidIssuanceStatus.pendingCredential;
