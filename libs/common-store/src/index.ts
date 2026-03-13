
import { preferencesReducer as localReducer } from "./lib/store/preferences";
export {preferencesReset, selectIsBiometricEnabled, selectSessionId, selectFontPreference, preferencesSetIsBiometricEnabled, preferencesSetIsOnboardingDone, selectIsOnboardingComplete} from "./lib/store/preferences"



export const preferencesReducer= {
  preferences: localReducer
};

export type PreferenceRootState = {
  preferences: ReturnType<typeof localReducer>;
}
