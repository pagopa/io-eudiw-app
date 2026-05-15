import { debugRootReducer } from './lib/reducer/debug';
export * from './lib/utils';
export { DebugInfoOverlay } from './lib/components/DebugInfoOverlay';
export * from './lib/hooks/useDebugInfo';
export {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from './lib/reducer/debug';
export { type DebugRootState } from './lib/reducer/index';

export const debugReducer = {
  debug: debugRootReducer
};
