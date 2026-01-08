/**
 * Cross-slice selectors for the wallet's internal logic
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/types';
import {
  itwCredentialsPidStatusSelector,
  selectCredentials
} from '../credentials';
import { lifecycleIsValidSelector } from '../lifecycle';
import { wellKnownCredential } from '../../utils/credentials';

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
