import { useDispatch, useSelector } from 'react-redux';
import { identificationReducer, IdentificationSlice } from './identification';
import {
  combineReducers,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { pinReducer, PinState, purgePinPersistedState } from './pin';
import {
  PreferenceRootState,
  preferencesReset
} from '@io-eudiw-app/preferences';

export type IdentificationCombinedRootState = {
  identification: {
    identification: IdentificationSlice;
    pin: PinState;
  };
} & PreferenceRootState;

export type IdentificationRootState = {
  identification: IdentificationSlice;
  pin: PinState;
};

export type IdentificationDispatch = ThunkDispatch<
  IdentificationCombinedRootState,
  undefined,
  UnknownAction
>;

/**
 * Purges all identification persisted state from storage.
 * This should be called when the identification state is reset
 * to ensure the persisted state is also cleared.
 */
export const purgeIdentificationPersistedState = () => purgePinPersistedState();

const combinedReducer = combineReducers({
  identification: identificationReducer,
  pin: pinReducer
});

/**
 * Root Reducer with Global Reset Logic
 * We intercept 'preferencesReset'. When this action is dispatched,
 * we pass 'undefined' as the state to the combinedReducer.
 * This forces all slices to return to their initial state.
 */
export const identificationRootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: UnknownAction
) => {
  if (action.type === preferencesReset.type) {
    state = undefined;
  }
  return combinedReducer(state, action);
};

/**
 * A typed selector hook for internal use within the wallet submodule.
 * It only knows about the `wallet` slice of the global state.
 */
export const useAppSelector =
  useSelector.withTypes<IdentificationCombinedRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<IdentificationDispatch>();
