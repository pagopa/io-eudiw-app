/* eslint-disable no-restricted-imports */
import {configureStore} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist';
import {useDispatch, useSelector} from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../saga';
import {AppDispatch, RootState} from './types';
import {startupSlice} from './reducers/startup';
import {pinReducer} from './reducers/pin';
import {preferencesReducer} from './reducers/preferences';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

/**
 * Redux store configuration.
 * Ignore all the action types dispatched by Redux Persist and add the saga middleware.
 */
export const store = configureStore({
  reducer: {
    startup: startupSlice.reducer,
    preferences: preferencesReducer,
    pin: pinReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] // Ignore all the action types dispatched by Redux Persist
      }
    }).concat(sagaMiddleware)
});

/**
 * Run the main saga.
 */
sagaMiddleware.run(rootSaga);

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