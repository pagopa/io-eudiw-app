import { 
  configureStore, 
  EnhancedStore, 
  isAnyOf, 
  combineReducers, 
  UnknownAction 
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist';
import reactotron from '../config/reactotron';
import { listenerMiddleware, startAppListening } from '../middleware/listener';
import { startupListener } from '../middleware/listener/startup';
import { deepLinkingReducer } from './reducers/deeplinking';
import { startupSetLoading, startupSlice } from './reducers/startup';
import { AppDispatch, RootState } from './types';
import { walletReducer, WalletRootState } from '@io-eudiw-app/it-wallet';
import { PreferenceRootState, preferencesReducer, preferencesReset } from '@io-eudiw-app/common-store';
import { debugReducer, DebugRootState } from "@io-eudiw-app/debug-info";
import { identificationReducer, IdentificationRootState } from '@io-eudiw-app/identification';

// 1. Explicitly type the combined state of all your reducers.
export type AppRootState = DebugRootState & 
  IdentificationRootState & 
  WalletRootState & 
  PreferenceRootState & {
    deepLinking: ReturnType<typeof deepLinkingReducer>;
    startup: ReturnType<typeof startupSlice.reducer>;
  };

/**
 * Combine all reducers into a single object.
 * This makes it easy to pass them to the rootReducer wrapper.
 */
const combinedReducer = combineReducers({
  startup: startupSlice.reducer,
  ...preferencesReducer,
  ...debugReducer,
  ...identificationReducer,
  ...walletReducer,
  deepLinking: deepLinkingReducer
});

/**
 * Intercepts the reset action to clear the entire state tree.
 */
const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action: UnknownAction) => {
  if (action.type === preferencesReset.type) {
    state = undefined;
  }
  return combinedReducer(state, action);
};

/**
 * Redux store configuration.
 */
export const store: EnhancedStore<AppRootState> = configureStore({
  // Use the wrapped rootReducer instead of the reducer object
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).prepend(listenerMiddleware.middleware),
  enhancers: getDefaultEnhancers =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers()
});

/**
 * Start global listeners.
 */
startAppListening({
  matcher: isAnyOf(startupSetLoading, preferencesReset),
  effect: startupListener
});

/**
 * Redux persistor configuration.
 */
export const persistor = persistStore(store);

/**
 * Hook to use the Redux selector function with the correct type.
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Hook to use the Redux dispatch function with the correct type.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();