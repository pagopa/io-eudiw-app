import { preferencesReducer as localReducer } from './lib/store/preferences';
export {
  preferencesFontSet,
  preferencesReset,
  preferencesResetMiniAppSelection,
  preferencesSetIsBiometricEnabled,
  preferencesSetIsFirstStartupFalse,
  preferencesSetIsOnboardingDone,
  preferencesSetSelectedMiniAppId,
  selectFontPreference,
  selectIsBiometricEnabled,
  selectIsFirstStartup,
  selectIsOnboardingComplete,
  selectSelectedMiniAppId,
  type TypefaceChoice
} from './lib/store/preferences';

export const preferencesReducer = {
  preferences: localReducer
};

export type PreferenceRootState = {
  preferences: ReturnType<typeof localReducer>;
};
