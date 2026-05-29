import { isAnyOf } from '@reduxjs/toolkit';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { removeCredential } from '../store/credentials';
import { resetLifecycle } from '../store/lifecycle';
import { wellKnownCredential } from '../utils/credentials';
import { CredentialsVault } from '../utils/itwCredentialVault';
import { AppStartListening } from './types';

/**
 * Wires the credential vault to Redux:
 *
 * - On `removeCredential` the matching encoded credential is deleted from
 *   the vault so secure storage stays in sync with the Redux metadata.
 * - On `resetLifecycle`, `preferencesReset` and
 *   `preferencesSetIsFirstStartupFalse` the vault is wiped along with
 *   the Redux slice.
 *
 * Errors are swallowed: a vault write failure must not block the Redux
 * state transition that triggered it. The coherence listener fixes any
 * residual drift at the next app boot.
 */
export const addCredentialVaultListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: removeCredential,
    effect: async action => {
      // Match the reducer: the PID is never removed via this action
      if (action.payload.credentialType === wellKnownCredential.PID) {
        return;
      }
      try {
        await CredentialsVault.remove(action.payload.credentialType);
      } catch {
        /* swallow: Redux state has already been updated */
      }
    }
  });

  startAppListening({
    matcher: isAnyOf(
      resetLifecycle,
      preferencesReset,
      preferencesSetIsFirstStartupFalse
    ),
    effect: async () => {
      try {
        await CredentialsVault.clear();
      } catch {
        /* swallow: Redux state has already been reset */
      }
    }
  });
};
