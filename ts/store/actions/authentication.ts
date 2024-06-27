import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export type CheckSessionResult = {
  isSessionValid: boolean;
};

export const sessionExpired = createStandardAction("SESSION_EXPIRED")();

export const firstOnboardingCompleted = createStandardAction(
  "FIRST_ONBOARDING_COMPLETED"
)();

export const sessionInvalid = createStandardAction("SESSION_INVALID")();

export const checkCurrentSession = createAsyncAction(
  "CHECK_CURRENT_SESSION_REQUEST",
  "CHECK_CURRENT_SESSION_SUCCESS",
  "CHECK_CURRENT_SESSION_FAILURE"
)<void, CheckSessionResult, Error>();

export type AuthenticationActions =
  | ActionType<typeof sessionExpired>
  | ActionType<typeof sessionInvalid>
  | ActionType<typeof checkCurrentSession>;
