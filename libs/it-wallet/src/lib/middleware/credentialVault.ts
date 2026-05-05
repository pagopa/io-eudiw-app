import { isAnyOf } from '@reduxjs/toolkit';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import {
  addCredential,
  hydrateCredentials,
  itwSetClaimValuesHidden,
  removeCredential
} from '../store/credentials';
import { resetLifecycle } from '../store/lifecycle';
import { itwCredentialVault } from '../utils/itwCredentialVault';
import { AppListener, AppStartListening } from './types';

/**
 * Wires the credential vault to Redux:
 *
 * - On `removeCredential` the matching encoded credential is deleted from
 *   the vault and the metadata snapshot is rewritten.
 * - On `addCredential` and `itwSetClaimValuesHidden` the metadata snapshot
 *   is rewritten so secure storage stays in sync with Redux.
 * - On `resetLifecycle`, `preferencesReset` and
 *   `preferencesSetIsFirstStartupFalse` the vault (encoded payloads,
 *   index, and metadata snapshot) is wiped.
 *
 * Errors are swallowed: a vault write failure must not block the Redux
 * state transition that triggered it. The next successful mutation
 * brings the storage back in sync.
 */
export const addCredentialVaultListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: removeCredential,
    effect: async (action, listenerApi) => {
      try {
        await itwCredentialVault.remove(action.payload.credentialType);
      } catch {
        /* swallow: Redux state has already been updated */
      }
      await writeMetadataSnapshot(listenerApi);
    }
  });

  startAppListening({
    matcher: isAnyOf(
      addCredential,
      itwSetClaimValuesHidden,
      hydrateCredentials
    ),
    effect: async (_, listenerApi) => {
      await writeMetadataSnapshot(listenerApi);
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
        await itwCredentialVault.clear();
      } catch {
        /* swallow: Redux state has already been reset */
      }
    }
  });
};

const writeMetadataSnapshot = async (listenerApi: AppListener) => {
  try {
    const { credentials, valuesHidden } =
      listenerApi.getState().wallet.credentials;
    await itwCredentialVault.putMetadata({ credentials, valuesHidden });
  } catch {
    /* swallow: a failed write-through must not break the dispatch */
  }
};
