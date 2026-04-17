import { preferencesReducer as localReducer } from './lib/store/preferences';
export {
  preferencesReset,
  preferencesFontSet,
  type TypefaceChoice,
  selectIsBiometricEnabled,
  selectSessionId,
  selectFontPreference,
  preferencesSetIsBiometricEnabled,
  preferencesSetIsOnboardingDone,
  preferencesSetIsFirstStartupFalse,
  selectIsOnboardingComplete,
  selectIsFirstStartup
} from './lib/store/preferences';

export const preferencesReducer = {
  preferences: localReducer
};

export type PreferenceRootState = {
  preferences: ReturnType<typeof localReducer>;
};
