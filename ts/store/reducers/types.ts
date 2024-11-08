import { PersistPartial } from "redux-persist";
import { PersistedFeaturesState } from "../../features/common/store/reducers";
import { AppState } from "./appState";
import { NavigationState } from "./navigation";
import { DebugState } from "./debug";
import { PersistedStartupState } from "./startup";
import { PersistedPreferencesState } from "./persistedPreferences";
import { PersistedIdentificationState } from "./identification";
import { PersistedOnboardingState } from "./onboarding";

export type GlobalState = Readonly<{
  appState: AppState;
  onboarding: PersistedOnboardingState;
  navigation: NavigationState;
  identification: PersistedIdentificationState;
  debug: DebugState;
  persistedPreferences: PersistedPreferencesState;
  startup: PersistedStartupState;
  features: PersistedFeaturesState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
