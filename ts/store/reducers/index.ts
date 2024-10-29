/**
 * Aggregates all defined reducers
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, Reducer } from "redux";
import { PersistConfig, persistReducer } from "redux-persist";
import { featuresPersistor } from "../../features/common/store/reducers";
import createSecureStorage from "../storages/keychain";
import { Action } from "../actions/types";
import { DateISO8601Transform } from "../transforms/dateISO8601Tranform";
import appStateReducer from "./appState";
import { navigationReducer } from "./navigation";
import { GlobalState } from "./types";
import { debugReducer } from "./debug";
import startupReducer, { StartupState } from "./startup";
import persistedPreferencesReducer, {
  PreferencesState
} from "./persistedPreferences";
import identificationReducer, { IdentificationState } from "./identification";
import onboardingReducer, { OnboardingState } from "./onboarding";

// A custom configuration to store the authentication into the Keychain
export const authenticationPersistConfig: PersistConfig = {
  key: "authentication",
  storage: createSecureStorage(),
  blacklist: ["deepLink"]
};

// A custom configuration to store the fail information of the identification section
export const identificationPersistConfig: PersistConfig = {
  key: "identification",
  storage: AsyncStorage,
  blacklist: ["progress"],
  transforms: [DateISO8601Transform]
};

export const onboardingPersistConfig: PersistConfig = {
  key: "onboarding",
  storage: AsyncStorage,
  blacklist: [],
  transforms: [DateISO8601Transform]
};

export const persistedPreferencesConfig: PersistConfig = {
  key: "persistedPreferences",
  storage: AsyncStorage,
  blacklist: [],
  transforms: [DateISO8601Transform]
};

export const startupConfig: PersistConfig = {
  key: "startup",
  storage: AsyncStorage,
  blacklist: [],
  transforms: [DateISO8601Transform]
};

/**
 * Here we combine all the reducers.
 * We use the best practice of separating UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex.
 * errors/spinners).
 * DATA state is where we store real data fetched from the API (ex.
 * profile/messages).
 * More at
 * @https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1
 */
export const appReducer: Reducer<GlobalState, Action> = combineReducers<
  GlobalState,
  Action
>({
  //
  // ephemeral state
  //
  appState: appStateReducer,
  navigation: navigationReducer,
  startup: persistReducer<StartupState, Action>(startupConfig, startupReducer),

  // standard persistor, see configureStoreAndPersistor.ts
  // standard persistor, see configureStoreAndPersistor.ts
  identification: persistReducer<IdentificationState, Action>(
    identificationPersistConfig,
    identificationReducer
  ),
  features: featuresPersistor,
  onboarding: persistReducer<OnboardingState, Action>(
    onboardingPersistConfig,
    onboardingReducer
  ),
  debug: debugReducer,
  persistedPreferences: persistReducer<PreferencesState, Action>(
    persistedPreferencesConfig,
    persistedPreferencesReducer
  )
});

// persistConfigs: ReadonlyArray<PersistConfig> as input
export function createRootReducer() {
  return (state: GlobalState | undefined, action: Action): GlobalState => {
    return appReducer(state, action);
  };
}
