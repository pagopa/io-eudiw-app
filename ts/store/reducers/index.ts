/**
 * Aggregates all defined reducers
 */
import { combineReducers, Reducer } from "redux";
import { PersistConfig } from "redux-persist";
import { Action } from "../actions/types";
import appStateReducer from "./appState";
import { navigationReducer } from "./navigation";
import { GlobalState } from "./types";
import { debugReducer } from "./debug";
import startupReducer from "./startup";
import persistedPreferencesReducer from "./persistedPreferences";

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
  startup: startupReducer,

  // standard persistor, see configureStoreAndPersistor.ts
  debug: debugReducer,
  persistedPreferences: persistedPreferencesReducer
});

export function createRootReducer(
  persistConfigs: ReadonlyArray<PersistConfig>
) {
  return (state: GlobalState | undefined, action: Action): GlobalState => {
    return appReducer(state, action);
  };
}
