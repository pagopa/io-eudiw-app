import { call, put, take } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";

import ROUTES from "../../../navigation/routes";
import NavigationService from "../../../navigation/NavigationService";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";

export function* handleBiometricAvailable() {
  yield* call(buildBiometricNavigator(ROUTES.ONBOARDING_FINGERPRINT));

  yield* take(preferenceFingerprintIsEnabledSaveSuccess);

  yield* call(removeBiometricScreen);
}

export function* handleMissingDevicePin() {
  yield* call(buildBiometricNavigator(ROUTES.ONBOARDING_MISSING_DEVICE_PIN));

  yield* take(preferenceFingerprintIsEnabledSaveSuccess);

  yield* call(removeBiometricScreen);
}

export function* handleBiometricNotEnrolled() {
  yield* call(
    buildBiometricNavigator(ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC)
  );

  yield* take(preferenceFingerprintIsEnabledSaveSuccess);

  yield* call(removeBiometricScreen);
}

export function* handleBiometricNotSupported() {
  yield* put(
    preferenceFingerprintIsEnabledSaveSuccess({
      isFingerprintEnabled: false
    })
  );
}

const buildBiometricNavigator = (route: string) => () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: route
    })
  );

const removeBiometricScreen = () =>
  NavigationService.dispatchNavigationAction(StackActions.popToTop());
