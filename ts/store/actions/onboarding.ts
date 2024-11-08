/**
 * Action types and action creator related to the Onboarding.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const fingerprintAcknowledged = createStandardAction(
  "FINGERPRINT_ACKNOWLEDGED"
)();

export const tosAccepted = createStandardAction("TOS_ACCEPTED")<number>();

export const emailAcknowledged = createStandardAction("EMAIL_ACKNOWLEDGED")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export const clearOnboarding = createStandardAction("CLEAR_ONBOARDING")();

export const emailInsert = createStandardAction("EMAIL_INSERT")();

export const servicesOptinCompleted = createStandardAction(
  "SERVICES_OPTIN_COMPLETED"
)();

export const completeOnboarding = createStandardAction("COMPLETE_ONBOARDING")();

export const onBoardingCarouselCompleted = createStandardAction(
  "ONBOARDING_CAROUSEL_COMPLETED"
)<void>();

export const firstOnboardingCompleted = createStandardAction(
  "FIRST_ONBOARDING_COMPLETED"
)();

export const resetFirstOnboarding = createStandardAction(
  "RESET_FIRST_ONBOARDING"
)();

type OnboardingActionTypes =
  | typeof tosAccepted
  | typeof fingerprintAcknowledged
  | typeof emailInsert
  | typeof emailAcknowledged
  | typeof abortOnboarding
  | typeof clearOnboarding
  | typeof servicesOptinCompleted
  | typeof completeOnboarding
  | typeof firstOnboardingCompleted
  | typeof resetFirstOnboarding;

export type OnboardingActions = ActionType<OnboardingActionTypes>;
