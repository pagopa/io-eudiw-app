import * as O from "fp-ts/lib/Option";
import { call, take } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { createPinSuccess } from "../../store/actions/pinset";
import { PinString } from "../../types/PinString";
import { ReduxSagaEffect } from "../../types/utils";
import { getPin } from "../../utils/keychain";
import NavigationService from "../../navigation/NavigationService";
import { isValidPinNumber } from "../../utils/pin";
import ROUTES from "../../navigation/routes";

export function* checkConfiguredPinSaga(): Generator<
  ReduxSagaEffect,
  PinString,
  any
> {
  // We check whether the user has already created a unlock code by trying to retrieve
  // it from the Keychain
  const pinCode = yield* call(getPin);

  if (O.isSome(pinCode)) {
    if (isValidPinNumber(pinCode.value)) {
      return pinCode.value;
    }
  }

  // Go through the unlock code configuration screen
  yield* call(navigateToOnboardingPinScreenAction);

  // and block until a unlock code is set
  const resultAction = yield* take(createPinSuccess);
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.replace(ROUTES.MAIN)
  );

  return resultAction.payload;
}
