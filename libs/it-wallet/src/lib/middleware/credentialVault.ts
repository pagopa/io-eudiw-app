import { isAnyOf } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import {
  addCredential,
  removeCredential,
  selectCredentials
} from '../store/credentials';
import { resetLifecycle } from '../store/lifecycle';
import { itwCredentialVault } from '../utils/itwCredentialVault';
import { StoredCredentialMetadata } from '../utils/itwTypesUtils';
import { AppListener, AppStartListening } from './types';

/**
 * Wires the credential vault cleanup to the relevant Redux actions:
 * - `removeCredential` removes the matching encoded credential from the vault.
 * - `resetLifecycle`, `preferencesReset` and `preferencesSetIsFirstStartupFalse`
 *   wipe the entire vault so it stays consistent with the slice reset that the
 *   reducer performs in its `extraReducers`.
 *
 * Errors are swallowed: a vault cleanup failure must not block Redux from
 * applying the corresponding state transition.
 */
export const addCredentialVaultListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: removeCredential,
    effect: async action => {
      try {
        await itwCredentialVault.remove(action.payload.credentialType);
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
        await itwCredentialVault.clear();
      } catch {
        /* swallow: Redux state has already been reset */
      }
    }
  });

  // Coherence check after redux-persist rehydrates the credentials slice.
  // For every metadata in Redux without a matching vault entry the metadata
  // is dropped; vault entries with no matching metadata are deleted as
  // orphans, since the slice is the source of truth for credentials.
  startAppListening({
    predicate: action =>
      action.type === REHYDRATE &&
      (action as { key?: string }).key === 'credentials',
    effect: runCredentialVaultCoherenceCheck
  });
};

// Shape of a credential entry persisted before the vault split, where the
// encoded SD-JWT/MDOC was kept inside the slice next to the metadata.
type LegacyStoredCredential = StoredCredentialMetadata & {
  credential?: string;
};

const runCredentialVaultCoherenceCheck = async (
  _: unknown,
  listenerApi: AppListener
) => {
  try {
    // One-shot migration from the pre-vault layout: any rehydrated entry
    // that still carries the encoded credential is moved to the vault and
    // re-dispatched as metadata-only so the slice is cleaned up in place.
    const rehydrated = selectCredentials(
      listenerApi.getState()
    ) as Array<LegacyStoredCredential>;

    for (const entry of rehydrated) {
      if (!entry.credential) {
        continue;
      }
      try {
        const existing = await itwCredentialVault.get(entry.credentialType);
        if (!existing) {
          await itwCredentialVault.put(entry.credentialType, entry.credential);
        }
        const { credential: _encoded, ...metadata } = entry;
        listenerApi.dispatch(addCredential({ credential: metadata }));
      } catch {
        /* leave the legacy entry in place; next startup will retry */
      }
    }

    const metadata = selectCredentials(listenerApi.getState());
    const vaultTypes = await itwCredentialVault.getAllKeys();

    // Drop metadata whose encoded credential is missing in the vault.
    await Promise.all(
      metadata.map(async meta => {
        const encoded = await itwCredentialVault.get(meta.credentialType);
        if (!encoded) {
          listenerApi.dispatch(
            removeCredential({ credentialType: meta.credentialType })
          );
        }
      })
    );

    // Remove vault entries that no longer have metadata in Redux.
    const knownTypes = new Set(metadata.map(m => m.credentialType));
    const orphans = vaultTypes.filter(t => !knownTypes.has(t));
    await Promise.all(
      orphans.map(async type => {
        try {
          await itwCredentialVault.remove(type);
        } catch {
          /* skip individual orphan removal failures */
        }
      })
    );
  } catch {
    /* swallow: a failed coherence check must not block app startup */
  }
};
