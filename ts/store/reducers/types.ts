import { PersistPartial } from "redux-persist";
import { AppState } from "./appState";
import { NavigationState } from "./navigation";
import { DebugState } from "./debug";
import { StartupState } from "./startup";
import { PersistedPreferencesState } from "./persistedPreferences";

export type GlobalState = Readonly<{
  appState: AppState;
  navigation: NavigationState;
  debug: DebugState;
  persistedPreferences: PersistedPreferencesState;
  startup: StartupState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
