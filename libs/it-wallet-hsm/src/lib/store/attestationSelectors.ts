import { IoWallet } from '@pagopa/io-react-native-wallet';
import { createSelector } from '@reduxjs/toolkit';

import { WalletCombinedRootState } from '.';
import { WALLET_SPEC_VERSION } from '../utils/constants';

export const selectWalletInstanceAttestationRequestStatus = (
  state: WalletCombinedRootState
) => state.itWalletHsm.attestation.request;

/**
 * Selects the attestation from the attestation state in the given format.
 * @param format - The format of the attestation to select
 * @param state - The root state of the Redux store
 * @returns the attestation
 */
export const makeSelectWalletInstanceAttestation =
  (format: string) => (state: WalletCombinedRootState) =>
    state.itWalletHsm.attestation.wia.value?.[format];

export const selectWalletInstanceAttestationAsJwt =
  makeSelectWalletInstanceAttestation('jwt');
export const selectWalletInstanceAttestationAsSdJwt =
  makeSelectWalletInstanceAttestation('dc+sd-jwt');
export const selectWalletInstanceAttestationAsMdoc =
  makeSelectWalletInstanceAttestation('mso_mdoc');

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param state - the root state of the Redux store
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const shouldRequestWalletInstanceAttestationSelector: (
  state: WalletCombinedRootState
) => boolean = createSelector(
  selectWalletInstanceAttestationAsJwt,
  (attestation): boolean => {
    if (!attestation) {
      return true;
    }
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const payload = wallet.WalletInstanceAttestation.decode(attestation);
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    return now > expiryDate;
  }
);
