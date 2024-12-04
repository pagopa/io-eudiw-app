/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type PidIssuanceStatusState = {
  FIRST_FLOW: AsyncStatusValues<{authUrl: string}>;
  SECOND_FLOW: AsyncStatusValues<{credential: string}>;
};

// Initial state for the pin slice
const initialState: PidIssuanceStatusState = {
  FIRST_FLOW: setInitial(),
  SECOND_FLOW: setInitial()
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
export const pidIssuanceStatusSlice = createSlice({
  name: 'pidIssuanceStatus',
  initialState,
  reducers: {
    setPidIssuanceFirstFlowRequest: state => {
      state.FIRST_FLOW = setLoading();
    },
    setPidIssuanceFirstFlowError: (
      state,
      action: PayloadAction<{error: unknown}>
    ) => {
      state.FIRST_FLOW = setError(action.payload.error);
    },
    setPidIssuanceFirstFlowSuccess: (
      state,
      action: PayloadAction<{authUrl: string}>
    ) => {
      state.FIRST_FLOW = setSuccess({
        authUrl: action.payload.authUrl
      });
    },
    resetPidIssuanceFirstFlow: state => {
      state.FIRST_FLOW = setInitial();
    }
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const {
  setPidIssuanceFirstFlowError,
  setPidIssuanceFirstFlowRequest,
  setPidIssuanceFirstFlowSuccess,
  resetPidIssuanceFirstFlow
} = pidIssuanceStatusSlice.actions;

export const selectInstanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.FIRST_FLOW;

export const selectAuthUrl = (state: RootState) =>
  state.wallet.pidIssuanceStatus.FIRST_FLOW.success.status === true
    ? state.wallet.pidIssuanceStatus.FIRST_FLOW.success.data.authUrl
    : undefined;
