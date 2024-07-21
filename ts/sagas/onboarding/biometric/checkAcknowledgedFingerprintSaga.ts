import { call, put, select } from "typed-redux-saga/macro";
import { fingerprintAcknowledged } from "../../../store/actions/onboarding";
import { isFingerprintEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { getBiometricState, isDevicePinSet } from "../../../utils/biometrics";
import { ReduxSagaEffect } from "../../../types/utils";
import { isFingerprintAcknowledgedSelector } from "../../../store/reducers/onboarding";
import {
  handleBiometricAvailable,
  handleBiometricNotSupported,
  handleBiometricNotEnrolled,
  handleMissingDevicePin
} from "./biometricStateSaga";

function* onboardFingerprintIfAvailableSaga(): Generator<
  ReduxSagaEffect,
  void,
  void
> {
  yield* put(fingerprintAcknowledged());

  const biometricState = yield* call(getBiometricState);

  if (biometricState === "Available") {
    yield* call(handleBiometricAvailable);
  } else {
    const isOSPinSet = yield* call(isDevicePinSet);
    if (!isOSPinSet) {
      yield* call(handleMissingDevicePin);
      return;
    }
    if (biometricState === "NotEnrolled") {
      yield* call(handleBiometricNotEnrolled);
      return;
    }

    yield* call(handleBiometricNotSupported);
  }
}

/**
 * Retrieve from system state information about whether Fingerprint screen has
 * already been displayed or not. If yes, it ends the process. It launches the
 * saga that prompts it, otherwise. Consider that, like ToS, this should happen
 * at first launch of the app ONLY.
 */
export function* checkAcknowledgedFingerprintSaga(): Generator<
  ReduxSagaEffect,
  void,
  ReturnType<typeof isFingerprintAcknowledgedSelector>
> {
  // Query system state and check whether the user has already acknowledged biometric
  // recognition Screen. Consider that, like ToS, this should be displayed once.
  const isFingerprintAcknowledged = yield* select(
    isFingerprintAcknowledgedSelector
  );

  const isFingerprintEnabled = yield* select(isFingerprintEnabledSelector);

  if (!isFingerprintAcknowledged) {
    if (isFingerprintEnabled) {
      yield* put(fingerprintAcknowledged());
    } else {
      // Navigate to the FingerprintScreen and wait for acknowledgment
      yield* call(onboardFingerprintIfAvailableSaga);
    }
  }
}
