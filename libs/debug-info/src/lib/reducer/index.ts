import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import { DebugSlice } from "./debug";

export type DebugRootState = {
  debug: DebugSlice;
};


export type DebugDispatch = ThunkDispatch<
  DebugRootState, 
  undefined,              
  UnknownAction          
>;


/**
 * A typed selector hook for internal use within the wallet submodule.
 * It only knows about the `wallet` slice of the global state.
 */
export const useAppSelector = useSelector.withTypes<DebugRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<DebugDispatch>();