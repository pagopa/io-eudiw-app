import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { DebugState } from "./debug";
import { useDispatch, useSelector } from 'react-redux';

export type DebugPartialRootState = {
  debug: DebugState;
};

export type DebugDispatch = ThunkDispatch<
  DebugPartialRootState, 
  undefined,              
  UnknownAction          
>;


/**
 * A typed selector hook for internal use within the wallet submodule.
 * It only knows about the `wallet` slice of the global state.
 */
export const useAppSelector = useSelector.withTypes<DebugPartialRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<DebugDispatch>();