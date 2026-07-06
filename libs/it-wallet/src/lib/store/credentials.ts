import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { ItwJwtCredentialStatus, WalletCard } from '../types';
import { wellKnownCredential } from '../utils/credentials';
import { CredentialFormat, StoredCredential } from '../utils/itwTypesUtils';
import { secureStoragePersistor } from '@io-eudiw-app/commons';
import { WalletCombinedRootState } from '.';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';
import { getCredentialStatus } from '../utils/itwCredentialStatusUtils';

/* State type definition for the credentials slice.
 * This is stored as an array to avoid overhead due to map not being serializable,
 * thus needing to be converted to an array with a transformation.
 * pid - The PID credential
 * credentials - A map of all the stored credentials
 */
type CredentialsSlice = {
  credentials: Array<StoredCredential>;
  valuesHidden: boolean;
  banners: {
    pidInfoBannerActive: boolean;
    proximityInfoBannerActive: boolean;
  };
};

// Initial state for the credential slice
const initialState: CredentialsSlice = {
  credentials: [],
  valuesHidden: false,
  banners: {
    pidInfoBannerActive: true,
    proximityInfoBannerActive: true
  }
};

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
      action: PayloadAction<{ credential: StoredCredential }>
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
        return {
          credentials: state.credentials.filter(
            c => c.credentialType !== credentialType
          ),
          valuesHidden: state.valuesHidden,
          banners: state.banners
        };
      }
      return state;
    },
    itwSetClaimValuesHidden: (state, action: PayloadAction<boolean>) => {
      state.valuesHidden = action.payload;
    },
    // PID Info Banner
    disablePidInfoBanner: state => {
      state.banners.pidInfoBannerActive = false;
    },
    // Proximity Info Banner
    disableProximityInfoBanner: state => {
      state.banners.proximityInfoBannerActive = false;
    }
  },
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

/**
 * Redux persist configuration for the credential slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const credentialsPersistor: PersistConfig<CredentialsSlice> = {
  key: 'credentials',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the credential slice.
 */
export const credentialsReducer = persistReducer(
  credentialsPersistor,
  credentialsSlice.reducer
);

/**
 * Exports the actions for the credentials slice.
 */
export const {
  addCredential,
  removeCredential,
  addCredentialWithIdentification,
  addPidWithIdentification,
  itwSetClaimValuesHidden,
  disablePidInfoBanner,
  disableProximityInfoBanner
} = credentialsSlice.actions;

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

/**
 * Selector to determine whether there are any presentable credentials.
 * Returns `true` if there is at least one MDOC credential in the wallet,
 * which are the ones presentable over proximity.
 *
 * @param state - The global state.
 * @returns `true` if there is at least one presentable credential, `false` otherwise.
 */
export const hasPresentableCredentialsSelector = createSelector(
  selectCredentials,
  credentials =>
    credentials.some(credential => credential.format === CredentialFormat.MDOC)
);

/**
 * Checks if a given credential is expired based on its status.
 */
const isExpiredPresentableCredential = (credential: StoredCredential) => {
  const status = getCredentialStatus(credential);
  return status === 'expired' || status === 'jwtExpired';
};

/**
 * Selector to determine whether there are any presentable credentials.
 * Returns `true` if there is at least one MDOC credential in the wallet,
 * which are the ones presentable over proximity.
 *
 * @param state - The global state.
 * @returns `true` if there is at least one presentable credential, `false` otherwise.
 */
export const presentableCredentialsSelector = createSelector(
  selectCredentials,
  credentials =>
    credentials.filter(
      credential => credential.format === CredentialFormat.MDOC
    )
);

/**
 * Checks if all presentable credentials are expired.
 * @param presentableCredentialsByDocType - The presentable credentials by document type.
 * @returns `true` if all presentable credentials are expired, `false` otherwise.
 */
export const areAllPresentableCredentialsExpired = (
  presentableCredentials: StoredCredential[]
) => {
  return (
    presentableCredentials.length > 0 &&
    presentableCredentials.every(isExpiredPresentableCredential)
  );
};

/**
 * Selector to determine whether the Proximity QR Code screen should surface the
 * expired credentials banner.
 * Even when the PID and all presentable credentials are expired, the wallet
 * must still allow QR/NFC presentation so the relying party can decide whether
 * to accept the verification.
 *
 * @param state - The global state.
 * @returns `true` if the expired credentials banner should be shown.
 */
export const shouldShowExpiredProximityCredentialsBannerSelector =
  createSelector(
    itwCredentialsPidStatusSelector,
    presentableCredentialsSelector,
    (
      pidStatus: ItwJwtCredentialStatus | undefined,
      presentableCredentialsByDocType
    ) =>
      pidStatus === 'jwtExpired' &&
      areAllPresentableCredentialsExpired(presentableCredentialsByDocType)
  );

export const itwIsClaimValueHiddenSelector = (state: WalletCombinedRootState) =>
  state.wallet.credentials.valuesHidden;

/**
 * Selects whether the PID info banner is active (i.e. not yet dismissed by the user).
 * @param state - The global state.
 * @returns a boolean indicating whether the PID info banner is active
 */
export const selectPidInfoBannerActive = (state: WalletCombinedRootState) =>
  state.wallet.credentials.banners.pidInfoBannerActive;

/**
 * Selects whether the Proximity info banner is active (i.e. not yet dismissed by the user).
 * @param state - The global state.
 * @returns a boolean indicating whether the Proximity info banner is active
 */
export const selectProximityInfoBannerActive = (
  state: WalletCombinedRootState
) => state.wallet.credentials.banners.proximityInfoBannerActive;
