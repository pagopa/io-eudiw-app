import { RootState } from '../../../../store/types';

/**
 * Selects the instanceCreation async status.
 * @param state - The root state
 * @returns The instanceCreation async status
 */
export const selectInstanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.instanceCreation;

/**
 * Selects the issuance async status.
 * @param state - The root state
 * @returns The issuance async status
 */
export const selectPidIssuanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance;

/**
 * Selects the issuance data if the status is success.
 * @param state - The root state
 * @returns The issuance data if the status is success, otherwise undefined
 */
export const selectPidIssuanceData = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance.success.status === true
    ? state.wallet.pidIssuanceStatus.issuance.success.data
    : undefined;

/**
 * Selects the error occurred during the issuance flow.
 * @param state - The root state
 * @returns The error occurred during the issuance flow
 */
export const selectPidIssuanceError = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance.error.error;

/**
 * Selects the pending credential to issue after the Wallet Pid has been obtained
 * @param state - The root state
 * @returns The credential to issue after the wallet is operational
 */
export const selectPendingCredential = (state: RootState) =>
  state.wallet.pidIssuanceStatus.pendingCredential;
