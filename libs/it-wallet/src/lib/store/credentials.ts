import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { serializeError } from 'serialize-error';
import { ItwJwtCredentialStatus, WalletCard } from '../types';
import { wellKnownCredential } from '../utils/credentials';
import { getCredentialStatus } from '../utils/itwCredentialStatusUtils';
import {
  StoredCredential,
  StoredCredentialMetadata
} from '../utils/itwTypesUtils';
import { itwCredentialVault } from '../utils/itwCredentialVault';
import { WalletCombinedRootState } from '.';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';
import { createAppAsyncThunk } from '../middleware/thunk';

/* State type definition for the credentials slice.
 * Only credential metadata is kept here. The encoded SD-JWT/MDOC of each
 * credential is persisted separately by `itwCredentialVault` to keep the
 * size of the persisted slice bounded. The slice itself is not wired into
 * redux-persist: it is hydrated at boot via `hydrateCredentialsThunk` and
 * mirrored to secure storage by a write-through listener.
 */
type CredentialsSlice = {
  credentials: Array<StoredCredentialMetadata>;
  valuesHidden: boolean;
  /**
   * Set to `true` once the slice has been loaded from secure storage at
   * app startup. Consumers that require credentials to be ready (e.g.
   * the wallet UI) should gate on this flag.
   */
  credentialsHydrated: boolean;
};

// Initial state for the credential slice
const initialState: CredentialsSlice = {
  credentials: [],
  valuesHidden: false,
  credentialsHydrated: false
};

// On reset we wipe the user data but keep the hydration flag, otherwise the
// UI gate would re-trigger and block the screens after a logout/reset.
const resetState = (state: CredentialsSlice): CredentialsSlice => ({
  ...initialState,
  credentialsHydrated: state.credentialsHydrated
});

/**
 * Redux slice for the credential state. It allows to store the PID and other credentials.
 * This must be a separate slice because the credentials are stored using a custom persistor.
 */
const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    addCredential: (
      state,
      action: PayloadAction<{ credential: StoredCredentialMetadata }>
    ) => {
      const { credential } = action.payload;
      const existingIndex = state.credentials.findIndex(
        c => c.credentialType === credential.credentialType
      );
      if (existingIndex !== -1) {
        // If the credential already exists, replace it
        state.credentials[existingIndex] = credential;
      } else {
        // Otherwise add it
        state.credentials.push(credential);
      }
    },
    // Empty action which will be intercepted by the listener and trigger the identification before storing the PID
    addPidWithIdentification: (
      _,
      __: PayloadAction<{ credential: StoredCredential }>
    ) => {
      /* empty */
    },
    // Empty action which will be intercepted by the listener and trigger the identification before storing a credential
    addCredentialWithIdentification: (
      _,
      __: PayloadAction<{ credential: StoredCredential }>
    ) => {
      /* empty */
    },
    removeCredential: (
      state,
      action: PayloadAction<{ credentialType: string }>
    ) => {
      // If the credential is the PID, ignore it as it is not removable without resetting the lifecycle
      const { credentialType } = action.payload;
      if (credentialType !== wellKnownCredential.PID) {
        state.credentials = state.credentials.filter(
          c => c.credentialType !== credentialType
        );
      }
    },
    itwSetClaimValuesHidden: (state, action: PayloadAction<boolean>) => {
      state.valuesHidden = action.payload;
    },
    /**
     * Replaces the slice contents with the snapshot loaded from the
     * vault at boot. Always flips `credentialsHydrated` to `true` so the
     * UI gate can lift once the dispatch goes through.
     */
    hydrateCredentials: (
      _,
      action: PayloadAction<{
        credentials: Array<StoredCredentialMetadata>;
        valuesHidden: boolean;
      }>
    ) => ({
      credentials: action.payload.credentials,
      valuesHidden: action.payload.valuesHidden,
      credentialsHydrated: true
    })
  },
  extraReducers: builder => {
    // Reset the user data when preferences are reset, on first startup or
    // on wallet lifecycle reset. The hydration flag is preserved so that
    // the UI gate stays open.
    builder.addCase(preferencesReset, resetState);
    builder.addCase(resetLifecycle, resetState);
    builder.addCase(preferencesSetIsFirstStartupFalse, resetState);
  }
});

/**
 * Plain reducer for the credentials slice. The slice is intentionally
 * NOT wrapped with `persistReducer`: persistence is handled directly via
 * `itwCredentialVault.putMetadata` so that the rehydration step never
 * touches the encoded SD-JWT/MDOC payloads.
 */
export const credentialsReducer = credentialsSlice.reducer;

/**
 * Exports the actions for the credentials slice.
 */
export const {
  addCredential,
  removeCredential,
  addCredentialWithIdentification,
  addPidWithIdentification,
  itwSetClaimValuesHidden,
  hydrateCredentials
} = credentialsSlice.actions;

/**
 * Persists a credential bundle: writes the encoded SD-JWT/MDOC to the
 * vault first, and only on success commits the metadata to the Redux
 * slice. If the vault write fails, Redux is left untouched and the error
 * is propagated via `rejectWithValue` so the caller can surface it.
 */
export const persistCredential = createAppAsyncThunk<
  StoredCredentialMetadata,
  { credential: StoredCredential },
  { rejectValue: string }
>(
  'credentials/persist',
  async ({ credential }, { dispatch, rejectWithValue }) => {
    const { credential: encoded, ...metadata } = credential;
    try {
      await itwCredentialVault.put(metadata.credentialType, encoded);
    } catch (error) {
      return rejectWithValue(JSON.stringify(serializeError(error)));
    }
    dispatch(addCredential({ credential: metadata }));
    return metadata;
  }
);

export const selectCredentials = (state: WalletCombinedRootState) =>
  state.wallet.credentials.credentials;

export const selectCredential = (credentialType: string) =>
  createSelector(selectCredentials, credentials =>
    credentials.find(c => c.credentialType === credentialType)
  );

export const itwCredentialsPidSelector = selectCredential(
  wellKnownCredential.PID
);

/**
 * Returns the credential status and the error message corresponding to the status assertion error, if present.
 *
 * @param state - The global state.
 * @returns The credential status and the error message corresponding to the status assertion error, if present.
 */
export const itwCredentialsPidStatusSelector = createSelector(
  itwCredentialsPidSelector,
  pid =>
    pid ? (getCredentialStatus(pid) as ItwJwtCredentialStatus) : undefined
);

/**
 * Returns the pid credential expiration date, if present.
 *
 * @param state - The global state.
 * @returns The pid credential expiration date.
 */
export const itwCredentialsPidExpirationSelector = createSelector(
  itwCredentialsPidSelector,
  pid => pid?.expiration
);

/**
 * Selects all the credentials beside the PID and transforms them
 * into {@link ItwCredentialCardProps}
 */
export const selectWalletCards: (
  state: WalletCombinedRootState
) => Array<WalletCard> = createSelector(selectCredentials, credentials =>
  credentials
    .filter(cred => cred.credentialType !== wellKnownCredential.PID)
    .map(cred => ({
      key: cred.keyTag,
      type: 'itw',
      credentialType: cred.credentialType,
      credentialStatus: getCredentialStatus(cred)
    }))
);

export const itwIsClaimValueHiddenSelector = (state: WalletCombinedRootState) =>
  state.wallet.credentials.valuesHidden;

export const credentialsHydratedSelector = (state: WalletCombinedRootState) =>
  state.wallet.credentials.credentialsHydrated;

/**
 * Loads the credentials slice from secure storage at app startup,
 * bypassing redux-persist entirely. The thunk performs three steps:
 *
 * 1. Migration from the legacy redux-persist payload (if present): the
 *    encoded SD-JWT/MDOC of each entry is moved to the per-credential
 *    vault, the metadata is normalized, and the legacy key is purged.
 * 2. Coherence check: metadata entries without a matching vault entry
 *    are dropped, and orphan vault entries are removed.
 * 3. Dispatch of `hydrateCredentials` with the cleaned snapshot, which
 *    flips `credentialsHydrated` to `true` and unlocks the UI.
 *
 * Subsequent state mutations are mirrored to the vault by the
 * write-through listener in `middleware/credentialVault.ts`.
 */
export const hydrateCredentialsThunk = createAppAsyncThunk<void>(
  'credentials/hydrate',
  async (_, { dispatch }) => {
    let snapshot = await itwCredentialVault.getMetadata();

    // First-boot migration from the previous redux-persist layout.
    if (!snapshot) {
      const legacy = await itwCredentialVault.readLegacyPersistPayload();
      if (legacy) {
        const migrated: Array<StoredCredentialMetadata> = [];
        for (const entry of legacy.credentials) {
          const { credential: encoded, ...metadata } = entry;
          if (encoded) {
            try {
              await itwCredentialVault.put(metadata.credentialType, encoded);
            } catch {
              // Skip entries that cannot be migrated; they will be
              // surfaced to the user as missing credentials.
              continue;
            }
          }
          migrated.push(metadata);
        }
        snapshot = {
          credentials: migrated,
          valuesHidden: legacy.valuesHidden
        };
        // Best-effort cleanup of the legacy payload. Failure is non-fatal:
        // the next boot will read from the new metadata key first.
        try {
          await itwCredentialVault.clearLegacyPersistPayload();
        } catch {
          /* swallow */
        }
      }
    }

    const credentials = snapshot?.credentials ?? [];
    const valuesHidden = snapshot?.valuesHidden ?? false;

    // Coherence check: drop metadata whose encoded credential is missing.
    const reconciled: Array<StoredCredentialMetadata> = [];
    for (const meta of credentials) {
      const encoded = await itwCredentialVault.get(meta.credentialType);
      if (encoded) {
        reconciled.push(meta);
      }
    }

    // Drop vault entries that no longer have matching metadata.
    const knownTypes = new Set(reconciled.map(m => m.credentialType));
    const vaultTypes = await itwCredentialVault.getAllKeys();
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

    dispatch(
      hydrateCredentials({
        credentials: reconciled,
        valuesHidden
      })
    );

    // Persist the reconciled snapshot so subsequent boots can skip the
    // migration / coherence path entirely.
    try {
      await itwCredentialVault.putMetadata({
        credentials: reconciled,
        valuesHidden
      });
    } catch {
      /* swallow: write-through listener will retry on next mutation */
    }
  }
);
