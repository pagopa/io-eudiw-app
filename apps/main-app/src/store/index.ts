import {
  configureStore,
  EnhancedStore,
  isAnyOf,
  combineReducers
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
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import {
  PreferenceRootState,
  preferencesReducer,
  preferencesReset
} from '@io-eudiw-app/preferences';
import { debugReducer, DebugRootState } from '@io-eudiw-app/debug-info';
import {
  identificationReducer,
  IdentificationRootState
} from '@io-eudiw-app/identification';
import { takeLatestEffect } from '@io-eudiw-app/commons';
// 1. Explicitly type the combined state of all your reducers.
export type AppRootState = DebugRootState &
  IdentificationRootState & {
    wallet: ReturnType<typeof itWalletFeature.reducer.wallet>;
  } & PreferenceRootState & {
    deepLinking: ReturnType<typeof deepLinkingReducer>;
    startup: ReturnType<typeof startupSlice.reducer>;
  };

/**
 * Combine all reducers into a single object.
 * This makes it easy to pass them to the rootReducer wrapper.
 */
const rootReducer = combineReducers({
  startup: startupSlice.reducer,
  ...preferencesReducer,
  ...debugReducer,
  ...identificationReducer,
  ...itWalletFeature.reducer,
  deepLinking: deepLinkingReducer
});

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
 * Clear any previously registered listeners first to avoid duplicates on hot reload,
 * since listenerMiddleware is a module-level singleton that persists across re-evaluations.
 */
listenerMiddleware.clearListeners();
startAppListening({
  matcher: isAnyOf(startupSetLoading, preferencesReset),
  effect: takeLatestEffect(startupListener)
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
