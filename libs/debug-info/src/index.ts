import { debugReducer as debugRootReducer } from './lib/reducer/debug';
import { Reducer } from '@reduxjs/toolkit';
export * from './lib/utils';
export { DebugInfoOverlay } from  './lib/components/DebugInfoOverlay'
export * from './lib/hooks/useDebugInfo';
export {selectIsDebugModeEnabled, setDebugModeEnabled} from './lib/reducer/debug'

export const debugReducer: { debug: Reducer<ReturnType<typeof debugRootReducer>> } = {
  debug: debugRootReducer
};

export type DebugRootState = {
  debug: ReturnType<typeof debugRootReducer>
};
