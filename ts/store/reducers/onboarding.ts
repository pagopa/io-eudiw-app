/**
 * A reducer for the Onboarding.
 * @flow
 */
import { getType } from "typesafe-actions";
import { PersistPartial } from "redux-persist";
import {
  clearOnboarding,
  fingerprintAcknowledged
} from "../actions/onboarding";
import { Action } from "../actions/types";
import {
  firstOnboardingCompleted,
  sessionExpired,
  resetFirstOnboarding
} from "../actions/authentication";
import { GlobalState } from "./types";

export type OnboardingState = Readonly<{
  isFingerprintAcknowledged: boolean;
  firstOnboardingCompleted: boolean;
}>;

export type PersistedOnboardingState = OnboardingState & PersistPartial;

const INITIAL_STATE: OnboardingState = {
  isFingerprintAcknowledged: false,
  firstOnboardingCompleted: false
};

const reducer = (
  state: OnboardingState = INITIAL_STATE,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case getType(fingerprintAcknowledged):
      return {
        ...state,
        isFingerprintAcknowledged: true
      };
    case getType(sessionExpired):
    case getType(clearOnboarding):
      return INITIAL_STATE;
    case getType(firstOnboardingCompleted):
      return { ...state, firstOnboardingCompleted: true };
    case getType(resetFirstOnboarding):
      return { ...state, firstOnboardingCompleted: false };
    default:
      return state;
  }
};

export default reducer;

// Selector
export const isFingerprintAcknowledgedSelector = (
  state: GlobalState
): boolean => state.onboarding.isFingerprintAcknowledged;

// Selector
export const isFirstAppRun = (state: GlobalState): boolean =>
  !state.onboarding.firstOnboardingCompleted;
