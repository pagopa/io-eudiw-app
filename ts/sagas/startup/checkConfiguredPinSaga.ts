import * as O from "fp-ts/lib/Option";
import { call, take, select, put } from "typed-redux-saga/macro";
import { StackActions } from "@react-navigation/native";
import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { createPinSuccess } from "../../store/actions/pinset";
import { PinString } from "../../types/PinString";
import { ReduxSagaEffect } from "../../types/utils";
import { getPin } from "../../utils/keychain";
import NavigationService from "../../navigation/NavigationService";
import { isValidPinNumber } from "../../utils/pin";
import ROUTES from "../../navigation/routes";
import { isDevEnv } from "../../utils/environment";
import { isFirstAppRun } from "../../store/reducers/onboarding";
import { firstOnboardingCompleted } from "../../store/actions/onboarding";

export function* checkConfiguredPinSaga(): Generator<
  ReduxSagaEffect,
  PinString,
  any
> {
  // We check whether the user has already created a unlock code by trying to retrieve
  // it from the Keychain
  const pinCode = yield* call(getPin);
  const isFirstOnboarding = yield* select(isFirstAppRun);

  if (O.isSome(pinCode) && !isFirstOnboarding) {
    if (isValidPinNumber(pinCode.value)) {
      if (isDevEnv) {
        yield* call(
          NavigationService.dispatchNavigationAction,
          StackActions.replace(ROUTES.MAIN)
        );
      }
      return pinCode.value;
    }
  }

  // Go through the unlock code configuration screen
  yield* call(navigateToOnboardingPinScreenAction);

  // and block until a unlock code is set
  const resultAction = yield* take(createPinSuccess);

  /* If this is the first time the user opens the app, we need to mark the onboarding as done
   * This must be done here because keychain values like the pin a persisted across app reinstalls, thus we need to
   * make sure that the pin is set before marking the onboarding as done.
   */
  if (isFirstOnboarding) {
    yield* put(firstOnboardingCompleted());
  }

  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.replace(ROUTES.MAIN)
  );

  return resultAction.payload;
}
