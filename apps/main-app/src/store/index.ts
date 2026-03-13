import { configureStore, EnhancedStore, isAnyOf } from '@reduxjs/toolkit';
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


// 1. Explicitly type the combined state of all your reducers to prevent TS2742.
export type AppRootState = DebugRootState & IdentificationRootState & WalletRootState & PreferenceRootState &{
  deepLinking: ReturnType<typeof deepLinkingReducer>;
  startup: ReturnType<typeof startupSlice.reducer>;
};

/**
 * Redux store configuration.
 * 3. Look closely here: It is JUST `export const store = `
 * There is NO `: ReducersMapObject<...>` after `store`.
 */
export const store: EnhancedStore<AppRootState> = configureStore({
  reducer: {
    startup: startupSlice.reducer,
    ...preferencesReducer,
    ...debugReducer,
    ...identificationReducer,
    ...walletReducer,
    deepLinking: deepLinkingReducer
  },
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
 * Redux persistor configuration used in the root component with {@link PersistGate}.
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