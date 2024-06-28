import { ActionType, createStandardAction } from "typesafe-actions";
import { Locales } from "../../../locales/locales";

export const preferenceFingerprintIsEnabledSaveSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<{ isFingerprintEnabled: boolean }>();

export const preferredLanguageSaveSuccess = createStandardAction(
  "PREFERENCES_LANGUAGE_SAVE_SUCCESS"
)<{ preferredLanguage: Locales }>();

export type PersistedPreferencesActions = ActionType<
  | typeof preferredLanguageSaveSuccess
  | typeof preferenceFingerprintIsEnabledSaveSuccess
>;
