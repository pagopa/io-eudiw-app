import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { preferencesReset } from '../../../store/reducers/preferences';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';
import { createInstanceThunk } from '../middleware/instance';
import { obtainPidThunk } from '../middleware/pid';
import { StoredCredential } from '../utils/itwTypesUtils';
import { RequestedCredential } from './credentialIssuance';
import { resetLifecycle } from './lifecycle';

/* State type definition for the pidIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the PID issuance
 */
type PidIssuanceStatusState = {
  instanceCreation: AsyncStatusValues;
  issuance: AsyncStatusValues<StoredCredential>;
  pendingCredential: RequestedCredential;
};

// Initial state for the pidIssuance slice
const initialState: PidIssuanceStatusState = {
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
      action: PayloadAction<{ credential: RequestedCredential }>
    ) => {
      state.pendingCredential = action.payload.credential;
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
        state.issuance = setError(action.error);
      }
    });
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
    // This happens when the wallet state is reset
    builder.addCase(resetLifecycle, _ => initialState);
  }
});

/**
 * Exports the actions for the pidIssuance slice.
 */
export const { resetInstanceCreation, resetPidIssuance, setPendingCredential } =
  pidIssuanceStatusSlice.actions;

/**
 * Exports the reducer for the pidIssuance slice.
 */
export const { reducer: pidIssuanceStatusReducer } = pidIssuanceStatusSlice;
