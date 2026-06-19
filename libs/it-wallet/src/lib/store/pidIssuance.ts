import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createInstanceThunk } from '../middleware/instance';
import { obtainPidThunk } from '../middleware/pid';
import { StoredCredential } from '../utils/itwTypesUtils';
import { RequestedCredential } from './credentialIssuance';
import { ResolvedCredentialOffer } from '../types';
import {
  AsyncStatusValues,
  setInitial,
  setError,
  setSuccess,
  setLoading
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';

/**
 * A credential whose issuance is deferred until the PID has been obtained.
 * Besides the credential configuration id, it optionally carries the issuer URL
 * and, when the issuance was started from a credential offer, the whole resolved
 * offer (e.g. coming from a credential offer) so the issuance can resume against
 * the right issuer once the PID is available.
 */
export type PendingCredential =
  | {
      credential: RequestedCredential;
      issuerUrl?: string;
      offer?: ResolvedCredentialOffer;
    }
  | undefined;

/* State type definition for the pidIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the PID issuance
 */
/**
 * Discriminates the phase of the PID issuance flow an error originates from:
 * `issuance` for the OID4VCI exchange, `persist` for the vault write.
 */
export type PidIssuanceErrorType = 'issuance' | 'persist';

type PidIssuanceStatusSlice = {
  instanceCreation: AsyncStatusValues;
  issuance: AsyncStatusValues<StoredCredential, PidIssuanceErrorType>;
  pendingCredential: PendingCredential;
};

// Initial state for the pidIssuance slice
const initialState: PidIssuanceStatusSlice = {
  instanceCreation: setInitial(),
  issuance: setInitial(),
  pendingCredential: undefined
};

/**
 * Redux slice for the pidIssuance state. It holds the status of flows related to the PID issuance
 * allowing to handle the UI accordingly with a request, loading and success/error states along with their data, if necessary.
 */
const pidIssuanceStatusSlice = createSlice({
  name: 'pidIssuanceStatus',
  initialState,
  reducers: {
    resetInstanceCreation: state => {
      state.instanceCreation = setInitial();
    },
    resetPidIssuance: state => {
      state.issuance = setInitial();
    },
    setPendingCredential: (
      state,
      action: PayloadAction<{
        credential: RequestedCredential;
        issuerUrl?: string;
        offer?: ResolvedCredentialOffer;
      }>
    ) => {
      state.pendingCredential = action.payload;
    },
    // Sets the issuance error from a flow phase handled imperatively (e.g. the
    // vault persistence in the addPidWithIdentification listener) instead of a
    // thunk lifecycle, so the UI can surface it through selectPidIssuanceStatus.
    setPidIssuanceError: (
      state,
      action: PayloadAction<{ error: unknown; type: PidIssuanceErrorType }>
    ) => {
      state.issuance = setError(action.payload.error, action.payload.type);
    }
  },
  extraReducers: builder => {
    // Instance creation thunk
    builder.addCase(createInstanceThunk.fulfilled, state => {
      state.instanceCreation = setSuccess();
    });
    builder.addCase(createInstanceThunk.pending, state => {
      state.instanceCreation = setLoading();
    });
    builder.addCase(createInstanceThunk.rejected, (state, action) => {
      if (action.meta.aborted) {
        state.instanceCreation = setInitial();
      } else {
        state.instanceCreation = setError(action.error);
      }
    });
    // Pid issuance thunk
    builder.addCase(obtainPidThunk.fulfilled, (state, action) => {
      state.issuance = setSuccess(action.payload);
    });
    builder.addCase(obtainPidThunk.pending, state => {
      state.issuance = setLoading();
    });
    builder.addCase(obtainPidThunk.rejected, (state, action) => {
      if (action.meta.aborted) {
        state.issuance = setInitial();
      } else {
        state.issuance = setError(action.error, 'issuance');
      }
    });
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

/**
 * Exports the actions for the pidIssuance slice.
 */
export const {
  resetInstanceCreation,
  resetPidIssuance,
  setPendingCredential,
  setPidIssuanceError
} = pidIssuanceStatusSlice.actions;

/**
 * Exports the reducer for the pidIssuance slice.
 */
export const { reducer: pidIssuanceStatusReducer } = pidIssuanceStatusSlice;
