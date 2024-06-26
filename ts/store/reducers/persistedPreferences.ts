/**
 * A reducer for persisted preferences.
 */
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { Locales } from "../../../locales/locales";
import { preferredLanguageSaveSuccess } from "../actions/persistedPreferences";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PersistedPreferencesState = Readonly<{
  isFingerprintEnabled?: boolean;
  preferredLanguage?: Locales;
}>;

export const initialPreferencesState: PersistedPreferencesState = {
  preferredLanguage: "it" // Start with it for now
};

export const isFingerprintEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isFingerprintEnabled;

export default function preferencesReducer(
  state: PersistedPreferencesState = initialPreferencesState,
  action: Action
): PersistedPreferencesState {
  if (isActionOf(preferredLanguageSaveSuccess, action)) {
    return {
      ...state,
      preferredLanguage: action.payload.preferredLanguage
    };
  }

  return state;
}

// Selectors
export const persistedPreferencesSelector = (state: GlobalState) =>
  state.persistedPreferences;

// returns the preferred language as an Option from the persisted store
export const preferredLanguageSelector = createSelector<
  GlobalState,
  PersistedPreferencesState,
  O.Option<Locales>
>(persistedPreferencesSelector, pps => O.fromNullable(pps.preferredLanguage));
