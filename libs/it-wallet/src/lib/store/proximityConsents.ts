import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { secureStoragePersistor } from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { WalletCombinedRootState } from '.';
import { ProximityDetails } from '../screens/proximity/ItwProximityPresentationDetails';
import { resetLifecycle } from './lifecycle';

/**
 * Represents the claims associated with a specific credential type within a
 * proximity presentation consent.
 */
export type ConsentCredentialInfo = {
  credentialType: string;
  claimNames: Array<string>;
};

/**
 * Represents a consent given by the user to share a specific set of credential
 * claims with a Relying Party during a proximity presentation. A consent is
 * uniquely identified by the combination of RP, credential types and claim
 * names requested.
 */
export type ConsentData = {
  rpId: string;
  credentials: Array<ConsentCredentialInfo>;
};

/**
 * Collection of consents given by the user, indexed by their deterministic
 * lookup key (see {@link generateConsentKey}).
 */
export type ProximityConsents = Record<string, ConsentData>;

/**
 * Builds the {@link ConsentData} identifying the current proximity request from
 * its presentation details.
 */
export const getConsentDataFromProximityDetails = (
  proximityDetails: ProximityDetails
): ConsentData => ({
  rpId: proximityDetails[0]?.rpId ?? 'Unknown',
  credentials: proximityDetails.map(detail => ({
    credentialType: detail.credentialType,
    claimNames: detail.claimsToDisplay.map(claim => claim.id)
  }))
});

/**
 * Generates a deterministic key for a consent based on the RP id and the full
 * credential claims combination. Credentials and claims are sorted so the key
 * is stable regardless of input ordering. The canonical payload is used
 * directly as the key (the whole record is persisted in encrypted secure
 * storage, so hashing to keep keys opaque is unnecessary).
 */
export const generateConsentKey = (consent: ConsentData): string => {
  const sortedCredentials = [...consent.credentials]
    .sort((a, b) => a.credentialType.localeCompare(b.credentialType))
    .map(
      c =>
        `${c.credentialType}:${[...c.claimNames]
          .sort((a, b) => a.localeCompare(b))
          .join(',')}`
    )
    .join('::');

  return `${consent.rpId}::${sortedCredentials}`;
};

type ProximityConsentsState = {
  consents: ProximityConsents;
};

const initialState: ProximityConsentsState = {
  consents: {}
};

/**
 * Redux slice for persisted proximity presentation consents. When the user
 * chooses to save a consent it is stored here so future requests with the same
 * RP and claims combination skip the claims disclosure step.
 */
const proximityConsentsSlice = createSlice({
  name: 'proximityConsents',
  initialState,
  reducers: {
    itwGrantProximityConsent: (state, action: PayloadAction<ConsentData>) => {
      const key = generateConsentKey(action.payload);
      // No-op if the consent already exists
      if (!state.consents[key]) {
        state.consents[key] = action.payload;
      }
    }
  },
  extraReducers: builder => {
    // Reset the persisted consents together with the rest of the wallet state.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

const proximityConsentsPersist: PersistConfig<ProximityConsentsState> = {
  key: 'proximityConsents',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the proximity consents slice.
 */
export const proximityConsentsReducer = persistReducer(
  proximityConsentsPersist,
  proximityConsentsSlice.reducer
);

export const { itwGrantProximityConsent } = proximityConsentsSlice.actions;

/**
 * Returns whether a consent with the exact same RP, credential types and claim
 * names combination has already been persisted.
 */
export const selectProximityConsentExists =
  (consentData: ConsentData) =>
  (state: WalletCombinedRootState): boolean =>
    generateConsentKey(consentData) in state.wallet.proximityConsents.consents;
