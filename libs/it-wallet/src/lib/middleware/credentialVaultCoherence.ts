import { REHYDRATE } from 'redux-persist';
import {
  removeCredential,
  selectCredentials
} from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';
import { itwCredentialVault } from '../utils/itwCredentialVault';
import { AppStartListening } from './types';

const CREDENTIALS_PERSIST_KEY = 'credentials';

/**
 * Reconciles the Redux credentials slice with the vault after redux-persist
 * has rehydrated the slice from secure storage. Two kinds of drift can happen
 * if a previous app session crashed between the vault write and the Redux
 * commit (or vice versa):
 *
 * - Metadata in Redux without a matching encoded credential in the vault.
 *   The credential cannot be presented or used; we drop the metadata so the
 *   UI does not surface a broken card. PID is preserved: removing it would
 *   brick the wallet and a lifecycle reset is the only safe recovery path.
 * - Encoded credentials in the vault without matching metadata in Redux.
 *   The vault entry is unreachable; we delete it to avoid leaking storage
 *   for credentials the user already considers gone.
 */
export const addCredentialVaultCoherenceListener = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    predicate: action =>
      action.type === REHYDRATE &&
      (action as { key?: string }).key === CREDENTIALS_PERSIST_KEY,
    effect: async (_, listenerApi) => {
      const metadata = selectCredentials(listenerApi.getState());
      const knownTypes = new Set(metadata.map(c => c.credentialType));

      const vaultTypes = await itwCredentialVault.getAllKeys();
      const vaultSet = new Set(vaultTypes);

      for (const meta of metadata) {
        if (meta.credentialType === wellKnownCredential.PID) {
          // Skip PID: it cannot be removed without a lifecycle reset.
          continue;
        }
        if (!vaultSet.has(meta.credentialType)) {
          listenerApi.dispatch(
            removeCredential({ credentialType: meta.credentialType })
          );
        }
      }

      await Promise.all(
        vaultTypes
          .filter(t => !knownTypes.has(t))
          .map(async t => {
            try {
              await itwCredentialVault.remove(t);
            } catch {
              /* swallow individual failure */
            }
          })
      );
    }
  });
};
