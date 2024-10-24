/**
 * A reducer for persisted preferences.
 */
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { PersistPartial } from "redux-persist";
import { NativeModules, Platform } from "react-native";
import { Locales } from "../../../locales/locales";
import {
  preferenceFingerprintIsEnabledSaveSuccess,
  preferredLanguageSaveSuccess,
  resetPreferences
} from "../actions/persistedPreferences";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PreferencesState = Readonly<{
  isFingerprintEnabled?: boolean;
  preferredLanguage?: Locales;
}>;

export type PersistedPreferencesState = PreferencesState & PersistPartial;

export const initialPreferencesState: PreferencesState = {
  preferredLanguage:
    Platform.OS === "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier
};

export default function preferencesReducer(
  state: PreferencesState = initialPreferencesState,
  action: Action
): PreferencesState {
  if (isActionOf(preferenceFingerprintIsEnabledSaveSuccess, action)) {
    return {
      ...state,
      isFingerprintEnabled: action.payload.isFingerprintEnabled
    };
  }
  if (isActionOf(preferredLanguageSaveSuccess, action)) {
    return {
      ...state,
      preferredLanguage: action.payload.preferredLanguage
    };
  }
  if (isActionOf(resetPreferences, action)) {
    return {
      ...initialPreferencesState,
      isFingerprintEnabled: undefined
    };
  }

  return state;
}

// Selectors
export const persistedPreferencesSelector = (state: GlobalState) =>
  state.persistedPreferences;

export const isFingerprintEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isFingerprintEnabled;

// returns the preferred language as an Option from the persisted store
export const preferredLanguageSelector = createSelector<
  GlobalState,
  PersistedPreferencesState,
  O.Option<Locales>
>(persistedPreferencesSelector, pps => O.fromNullable(pps.preferredLanguage));
