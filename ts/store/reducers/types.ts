import { PersistPartial } from "redux-persist";
import { AppState } from "./appState";
import { NavigationState } from "./navigation";
import { DebugState } from "./debug";

export type GlobalState = Readonly<{
  appState: AppState;
  navigation: NavigationState;
  debug: DebugState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
