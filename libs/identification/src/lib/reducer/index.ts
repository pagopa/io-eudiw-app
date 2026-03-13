import { useDispatch, useSelector } from "react-redux";
import { identificationReducer, IdentificationState } from "./identification";
import { combineReducers, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { pinReducer, PinState } from "./pin";
import { PreferenceRootState } from "@io-eudiw-app/common-store";

export type IdentificationCombinedRootState = {
  identification: {
    identification: IdentificationState;
    pin: PinState;
  };
} & PreferenceRootState;

export type IdentificationRootState = {
  identification: IdentificationState;
  pin: PinState;
};

export type IdentificationDispatch = ThunkDispatch<
  IdentificationCombinedRootState, 
  undefined,              
  UnknownAction          
>;

export const identificationRootReducer = combineReducers({
  identification: identificationReducer,
  pin: pinReducer
});

/**
 * A typed selector hook for internal use within the wallet submodule.
 * It only knows about the `wallet` slice of the global state.
 */
export const useAppSelector = useSelector.withTypes<IdentificationCombinedRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<IdentificationDispatch>();