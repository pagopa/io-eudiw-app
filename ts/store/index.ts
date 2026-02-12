/* eslint-disable no-restricted-imports */
import { configureStore, isAnyOf } from '@reduxjs/toolkit';
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
import walletReducer from '../features/wallet/store/index';
import { listenerMiddleware, startAppListening } from '../middleware/listener';
import { startupListener } from '../middleware/listener/startup';
import { debugReducer } from './reducers/debug';
import { deepLinkingReducer } from './reducers/deeplinking';
import { identificationReducer } from './reducers/identification';
import { pinReducer } from './reducers/pin';
import { preferencesReducer, preferencesReset } from './reducers/preferences';
import { startupSetLoading, startupSlice } from './reducers/startup';
import { AppDispatch, RootState } from './types';

/**
 * Redux store configuration.
 */
export const store = configureStore({
  reducer: {
    startup: startupSlice.reducer,
    preferences: preferencesReducer,
    pin: pinReducer,
    wallet: walletReducer,
    identification: identificationReducer,
    debug: debugReducer,
    deepLinking: deepLinkingReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] // Ignore all the action types dispatched by Redux Persist
      }
    }).prepend(listenerMiddleware.middleware),
  enhancers: getDefaultEnhancers =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer()) // Adding Reactotron enhancer in development
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
