import { useDispatch, useSelector } from "react-redux";
import { identificationReducer, IdentificationState } from "./identification";
import { combineReducers, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { PreferencesPartialRootState } from "@io-eudiw-app/common-store";
import { pinReducer, PinState } from "./pin";

export type IdentificationPartialRootState = {
  identification: IdentificationState;
  pin: PinState;
} & PreferencesPartialRootState;

export type IdentificationDispatch = ThunkDispatch<
  IdentificationPartialRootState, 
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
export const useAppSelector = useSelector.withTypes<IdentificationPartialRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<IdentificationDispatch>();