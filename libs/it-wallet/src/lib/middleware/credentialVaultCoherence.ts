import { removeCredential, selectCredentials } from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';
import { CredentialsVault } from '../utils/itwCredentialVault';
import { WalletCombinedRootState, WalletDispatch } from '../store';
import { AppStartListening } from './types';

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
 *
 * This must be called once at startup, after the store has been fully
 * rehydrated by redux-persist (PersistGate guarantees this).
 */
const reconcileCredentialVaultCoherence = async (
  dispatch: WalletDispatch,
  getState: () => WalletCombinedRootState
) => {
  const metadata = selectCredentials(getState());
  const knownTypes = new Set(metadata.map(c => c.credentialType));

  const vaultTypes = await CredentialsVault.list();
  const vaultSet = new Set(vaultTypes);

  for (const meta of metadata) {
    if (meta.credentialType === wellKnownCredential.PID) {
      continue;
    }
    if (!vaultSet.has(meta.credentialType)) {
      dispatch(removeCredential({ credentialType: meta.credentialType }));
    } else {
      try {
        const credential = await CredentialsVault.get(meta.credentialType);
        if (!credential) {
          dispatch(removeCredential({ credentialType: meta.credentialType }));
          await CredentialsVault.remove(meta.credentialType);
        }
      } catch {
        dispatch(removeCredential({ credentialType: meta.credentialType }));
        await CredentialsVault.remove(meta.credentialType);
      }
    }
  }

  await Promise.all(
    vaultTypes
      .filter(t => !knownTypes.has(t))
      .map(async t => {
        try {
          await CredentialsVault.remove(t);
        } catch {
          /* swallow individual failure */
        }
      })
  );
};

/**
 * Registers a one-shot listener that runs the vault/Redux reconciliation
 * on the first action dispatched after the wallet listeners are mounted,
 * then unsubscribes itself. This is the single entry-point the host app
 * uses (via `addWalletListeners`) to wire reconciliation; the function
 * itself stays private to the wallet library.
 */
export const addCredentialVaultCoherenceListener = (
  startAppListening: AppStartListening
) => {
  const unsubscribe = startAppListening({
    predicate: () => true,
    effect: async (_action, listenerApi) => {
      unsubscribe();
      try {
        await reconcileCredentialVaultCoherence(
          listenerApi.dispatch,
          listenerApi.getState
        );
      } catch {
        /* swallow: drift will be retried at the next app boot */
      }
    }
  });
};
