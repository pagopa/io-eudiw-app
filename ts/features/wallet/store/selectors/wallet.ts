/**
 * Cross-slice selectors for the wallet's internal logic
 */

import { createSelector } from '@reduxjs/toolkit';
import _ from 'lodash';
import { RootState } from '../../../../store/types';
import {
  itwCredentialsPidSelector,
  itwCredentialsPidStatusSelector,
  selectCredentials
} from '../credentials';
import { lifecycleIsValidSelector } from '../lifecycle';
import { wellKnownCredential } from '../../utils/credentials';
import {
  getFamilyNameFromCredential,
  getFirstNameFromCredential,
  getFiscalCodeFromCredential
} from '../../utils/itwClaimsUtils';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';

/**
 * Returns the credentials object from the itw credentials state, excluding the PID credential.
 * Only SD-JWT credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsSelector = createSelector(
  selectCredentials,
  credentials =>
    credentials.filter(
      credential => credential.credentialType !== wellKnownCredential.PID
    )
);

/**
 * Returns the number of credentials in the credentials object, excluding the pid credential.
 *
 * @param state - The global state.
 * @returns The number of credentials.
 */
const itwCredentialsSizeSelector = createSelector(
  itwCredentialsSelector,
  credentials => Object.keys(credentials).length
);

/**
 * Returns whether the wallet is empty, i.e. it does not have any credential.
 * The pid is not considered, only other (Q)EAAs.
 *
 * Note: this selector does not check the wallet validity.
 *
 * @param state - The global state.
 * @returns Whether the wallet is empty.
 */
export const itwIsWalletEmptySelector = createSelector(
  itwCredentialsSizeSelector,
  size => size === 0
);

/**
 * Returns if the wallet ready banner should be visible. The banner is visible if:
 * - The Wallet has valid Wallet Instance with a known status, and a valid pid
 * - The Wallet Instance is not in a failure status (NOTE: this check is not yet implemented)
 * - The pid is not expired
 * - The Wallet is empty
 * @param state the application global state
 * @returns true if the banner should be visible, false otherwise
 */
export const itwShouldRenderWalletReadyBannerSelector = (state: RootState) =>
  lifecycleIsValidSelector(state) &&
  // NOTE: Wallet instance status not yet implemented
  // NOTE: Online status checks not yet implemented
  itwCredentialsPidStatusSelector(state) !== 'jwtExpired' &&
  itwIsWalletEmptySelector(state);

/**
 * Returns the fiscal code from the stored eID.
 *
 * @param state - The global state.
 * @returns The fiscal code.
 */
export const selectFiscalCodeFromEid = createSelector(
  itwCredentialsPidSelector,
  pid => getFiscalCodeFromCredential(pid) ?? ''
);

/**
 * Returns the name and surname from the stored eID.
 *
 * @param state - The global state.
 * @returns The name and surname.
 */
export const selectNameSurnameFromEid = createSelector(
  itwCredentialsPidSelector,
  pid => {
    const firstName = getFirstNameFromCredential(pid);
    const familyName = getFamilyNameFromCredential(pid);
    return `${_.capitalize(firstName)} ${_.capitalize(familyName)}`.trim();
  }
);

/**
 * Get the credential status and the error message corresponding to the status assertion error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 *
 * @param state - The global state.
 * @param type - The credential type.
 * @returns The credential status and the error message corresponding to the status assertion error, if present.
 */
export const itwCredentialStatusSelector = createSelector(
  itwCredentialsSelector,
  (_state: RootState, type: string) => type,
  (credentials, type) => {
    const credential = credentials.find(
      ({ credentialType }) => credentialType === type
    );
    // This should never happen
    if (credential === undefined) {
      return { status: undefined, message: undefined };
    }

    return { status: getCredentialStatus(credential), message: undefined };
  }
);
