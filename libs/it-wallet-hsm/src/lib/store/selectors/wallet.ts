/**
 * Cross-slice selectors for the wallet's internal logic
 */

import { createSelector } from '@reduxjs/toolkit';

import { WalletCombinedRootState } from '..';
import { wellKnownCredential } from '../../utils/credentials';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { selectCredentials } from '../credentials';

/**
 * Returns the credentials object from the itw credentials state, excluding the PID credential.
 * Only SD-JWT credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
const itwCredentialsSelector = createSelector(selectCredentials, credentials =>
  credentials.filter(
    credential => credential.credentialType !== wellKnownCredential.PID
  )
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
  (_state: WalletCombinedRootState, type: string) => type,
  (credentials, type) => {
    const credential = credentials.find(
      ({ credentialType }) => credentialType === type
    );
    // This should never happen
    if (credential === undefined) {
      return { message: undefined, status: undefined };
    }

    return { message: undefined, status: getCredentialStatus(credential) };
  }
);
