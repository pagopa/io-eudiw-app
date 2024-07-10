import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Reducer,
  Store
} from "redux";
import createDebugger from "redux-flipper";
import { createLogger } from "redux-logger";
import {
  PersistConfig,
  Persistor,
  persistReducer,
  persistStore
} from "redux-persist";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas";
import { Action, StoreEnhancer } from "../store/actions/types";
import { createRootReducer } from "../store/reducers";
import { GlobalState, PersistedGlobalState } from "../store/reducers/types";
import { DateISO8601Transform } from "../store/transforms/dateISO8601Tranform";
import { PotTransform } from "../store/transforms/potTransform";
import { isDevEnv } from "../utils/environment";
import { configureReactotron } from "./configureReactotron";

/**
 * Redux persist will migrate the store to the current version
 */
const CURRENT_REDUX_STORE_VERSION = 1;

const isDebuggingInChrome = isDevEnv && !!window.navigator.userAgent;

const rootPersistConfig: PersistConfig = {
  key: "root",
  storage: AsyncStorage,
  version: CURRENT_REDUX_STORE_VERSION,
  blacklist: ["features"],
  // Sections of the store that must be persisted and rehydrated with this storage.
  whitelist: ["debug", "onboarding"],
  // Transform functions used to manipulate state on store/rehydrate
  // TODO: add optionTransform https://www.pivotaltracker.com/story/show/170998374
  transforms: [DateISO8601Transform, PotTransform]
};

const persistedReducer: Reducer<PersistedGlobalState, Action> = persistReducer<
  GlobalState,
  Action
>(rootPersistConfig, createRootReducer([rootPersistConfig]));

const logger = createLogger({
  predicate: (): boolean => isDebuggingInChrome,
  collapsed: true,
  duration: true
});

// configure Reactotron if the app is running in dev mode
export const RTron = isDevEnv ? configureReactotron() : undefined;
const sagaMiddleware = createSagaMiddleware(
  // cast to any due to a type lacking
  RTron ? { sagaMonitor: (RTron as any).createSagaMonitor() } : {}
);

function configureStoreAndPersistor(): {
  store: Store<GlobalState, Action>;
  persistor: Persistor;
} {
  /**
   * If available use redux-devtool version of the compose function that allow
   * the inspection of the store from the devtool.
   */

  const composeEnhancers =
    // eslint-disable-next-line no-underscore-dangle
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const baseMiddlewares: ReadonlyArray<Middleware> = [sagaMiddleware, logger];

  const devMiddleware: ReadonlyArray<Middleware> = isDevEnv
    ? [createDebugger()]
    : [];

  const middlewares = applyMiddleware(
    ...[...baseMiddlewares, ...devMiddleware]
  );
  // add Reactotron enhancer if the app is running in dev mode

  const enhancer: StoreEnhancer =
    RTron && RTron.createEnhancer
      ? composeEnhancers(middlewares, RTron.createEnhancer())
      : composeEnhancers(middlewares);

  const store = createStore<
    PersistedGlobalState,
    Action,
    Record<string, unknown>,
    Record<string, unknown>
  >(persistedReducer, enhancer);
  const persistor = persistStore(store);

  if (isDebuggingInChrome) {
    // eslint-disable-next-line
    (window as any).store = store;
  }

  // Run the main saga
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}

export const { store, persistor } = configureStoreAndPersistor();
