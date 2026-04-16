import { useDispatch, useSelector } from 'react-redux';
import { identificationReducer, IdentificationSlice } from './identification';
import {
  combineReducers,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { pinReducer, PinState } from './pin';
import {
  PreferenceRootState,
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { initialState as identificationInitialState } from './identification';
import { initialState as pinInitialState } from './pin';

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

const combinedReducer = combineReducers({
  identification: identificationReducer,
  pin: pinReducer
});

/**
 * Root Reducer with Global Reset Logic
 * We intercept 'preferencesReset' and 'preferencesSetIsFirstStartupFalse'.
 * When these actions are dispatched this forces all slices to return to their initial state.
 */
export const identificationRootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: UnknownAction
) => {
  if (
    action.type === preferencesReset.type ||
    action.type === preferencesSetIsFirstStartupFalse.type
  ) {
    state = state
      ? {
          pin: {
            ...pinInitialState,
            _persist: state.pin._persist
          },
          identification: identificationInitialState
        }
      : state;
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
