import { takeLatestEffect } from '@io-eudiw-app/commons';
import { debugReducer, DebugRootState } from '@io-eudiw-app/debug-info';
import {
  identificationReducer,
  IdentificationRootState
} from '@io-eudiw-app/identification';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { deepLinkingReducer } from '@io-eudiw-app/navigation';
import {
  PreferenceRootState,
  preferencesReducer,
  preferencesReset
} from '@io-eudiw-app/preferences';
import {
  combineReducers,
  configureStore,
  EnhancedStore,
  isAnyOf
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
import {
  listenerMiddleware,
  miniAppListenerMiddleware,
  startAppListening
} from '../middleware/listener';
import { startupListener } from '../middleware/listener/startup';
import { startupSetLoading, startupSlice } from './reducers/startup';
import { AppDispatch, RootState } from './types';
// 1. Explicitly type the combined state of all your reducers.
export type AppRootState = DebugRootState &
  IdentificationRootState &
  PreferenceRootState & {
    deepLinking: ReturnType<typeof deepLinkingReducer>;
    startup: ReturnType<typeof startupSlice.reducer>;
  } & {
    wallet: ReturnType<typeof itWalletFeature.reducer.wallet>;
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
  enhancers: getDefaultEnhancers =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).prepend(
      listenerMiddleware.middleware,
      miniAppListenerMiddleware.middleware
    ),
  // Use the wrapped rootReducer instead of the reducer object
  reducer: rootReducer
});

/**
 * Start global listeners.
 * Clear any previously registered listeners first to avoid duplicates on hot reload,
 * since listenerMiddleware is a module-level singleton that persists across re-evaluations.
 */
listenerMiddleware.clearListeners();
startAppListening({
  effect: takeLatestEffect(startupListener),
  matcher: isAnyOf(startupSetLoading, preferencesReset)
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
