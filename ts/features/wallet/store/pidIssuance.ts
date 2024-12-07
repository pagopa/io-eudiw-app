/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';
import {
  asyncStateError,
  asyncStateLoading,
  asyncStateSuccess,
  asyncStatusInitial,
  AsyncStatusValues
} from '../../../store/utils/asyncStatus';

export type PidIssuanceStatusKeys = 'INSTANCE';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type PidIssuanceStatusState = Record<
  PidIssuanceStatusKeys,
  AsyncStatusValues
>;

// Initial state for the pin slice
const initialState: PidIssuanceStatusState = {
  ['INSTANCE']: asyncStatusInitial
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
export const pidIssuanceStatusSlice = createSlice({
  name: 'pidIssuanceStatus',
  initialState,
  reducers: {
    setInstanceRequest: state => {
      state.INSTANCE = asyncStateLoading;
    },
    setInstanceError: (state, action: PayloadAction<{error: unknown}>) => {
      state.INSTANCE = asyncStateError(action.payload.error);
    },
    setInstanceSuccess: state => {
      state.INSTANCE = asyncStateSuccess;
    },
    resetInstanceStatus: state => {
      state.INSTANCE = asyncStatusInitial;
    },
    resetPidIssuanceStatus: (
      state,
      action: PayloadAction<{key: PidIssuanceStatusKeys}>
    ) => {
      state[action.payload.key] = asyncStatusInitial;
    }
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const {
  setInstanceRequest,
  setInstanceError,
  setInstanceSuccess,
  resetInstanceStatus,
  resetPidIssuanceStatus
} = pidIssuanceStatusSlice.actions;

export const selectInstanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.INSTANCE;

export const selectStatusError =
  (key: PidIssuanceStatusKeys) => (state: RootState) =>
    state.wallet.pidIssuanceStatus[key].error;
