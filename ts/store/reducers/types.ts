import { PersistPartial } from "redux-persist";
import { PersistedFeaturesState } from "../../features/common/store/reducers";
import { AppState } from "./appState";
import { NavigationState } from "./navigation";
import { DebugState } from "./debug";
import { StartupState } from "./startup";
import { PersistedPreferencesState } from "./persistedPreferences";
import { ProfileState } from "./profile";
import { PersistedAuthenticationState } from "./authentication";
import { PersistedIdentificationState } from "./identification";
import { OnboardingState } from "./onboarding";

export type GlobalState = Readonly<{
  appState: AppState;
  authentication: PersistedAuthenticationState;
  onboarding: OnboardingState;
  profile: ProfileState;
  navigation: NavigationState;
  identification: PersistedIdentificationState;
  debug: DebugState;
  persistedPreferences: PersistedPreferencesState;
  startup: StartupState;
  features: PersistedFeaturesState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
