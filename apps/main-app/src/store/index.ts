import { configureStore, isAnyOf, ReducersMapObject } from '@reduxjs/toolkit';
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
import { debugReducer } from '../../../../libs/debug-info/src/lib/reducer/debug';
import { deepLinkingReducer } from './reducers/deeplinking';
import { identificationReducer } from '../../../../libs/identification/src/lib/identification';
import { pinReducer } from '../../../../libs/identification/src/lib/reducer/pin';
import { preferencesReducer, preferencesReset } from './reducers/preferences';
import { startupSetLoading, startupSlice } from './reducers/startup';
import { AppDispatch, RootState } from './types';
import { reducer, WalletState } from '@io-eudiw-app/it-wallet';

// 1. Explicitly type the combined state of all your reducers to prevent TS2742.
export interface AppRootState {
  wallet: WalletState;
  debug: ReturnType<typeof debugReducer>;
  deepLinking: ReturnType<typeof deepLinkingReducer>;
  identification: ReturnType<typeof identificationReducer>;
  pin: ReturnType<typeof pinReducer>;
  preferences: ReturnType<typeof preferencesReducer>;
  startup: ReturnType<typeof startupSlice.reducer>;
}

// 2. We put the explicit type HERE, on the reducer object, not on the store!
const rootReducer: ReducersMapObject<AppRootState> = {
  startup: startupSlice.reducer,
  preferences: preferencesReducer,
  pin: pinReducer,
  ...reducer,
  identification: identificationReducer,
  debug: debugReducer,
  deepLinking: deepLinkingReducer
};

/**
 * Redux store configuration.
 * 3. Look closely here: It is JUST `export const store = `
 * There is NO `: ReducersMapObject<...>` after `store`.
 */
export const store = configureStore({
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