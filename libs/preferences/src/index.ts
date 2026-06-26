import { preferencesReducer as localReducer } from './lib/store/preferences';
export {
  preferencesReset,
  preferencesFontSet,
  type TypefaceChoice,
  selectIsBiometricEnabled,
  selectFontPreference,
  selectSelectedMiniAppId,
  preferencesSetIsBiometricEnabled,
  preferencesSetIsOnboardingDone,
  preferencesSetIsFirstStartupFalse,
  preferencesSetSelectedMiniAppId,
  preferencesResetMiniAppSelection,
  preferencesDisablePidInfoBanner,
  selectIsOnboardingComplete,
  selectIsFirstStartup,
  selectPidInfoBanerActive
} from './lib/store/preferences';

export const preferencesReducer = {
  preferences: localReducer
};

export type PreferenceRootState = {
  preferences: ReturnType<typeof localReducer>;
};
