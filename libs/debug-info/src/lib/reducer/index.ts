import { PreferenceRootState } from '@io-eudiw-app/preferences';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { debugRootReducer } from './debug';

export type DebugCombinedRootState = PreferenceRootState & {
  debug: ReturnType<typeof debugRootReducer>;
};

export type DebugDispatch = ThunkDispatch<
  DebugCombinedRootState,
  undefined,
  UnknownAction
>;

export type DebugRootState = {
  debug: ReturnType<typeof debugRootReducer>;
};

/**
 * A typed selector hook for internal use within the wallet submodule.
 * It only knows about the `wallet` slice of the global state.
 */
export const useAppSelector = useSelector.withTypes<DebugCombinedRootState>();

// 2. Create and export the strongly-typed hook
export const useAppDispatch = useDispatch.withTypes<DebugDispatch>();
