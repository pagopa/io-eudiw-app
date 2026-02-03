import { isPinOrFingerprintSet } from 'react-native-device-info';
import FingerprintScanner, {
  AuthenticateIOS,
  Biometrics,
  Errors,
  FingerprintScannerError
} from 'react-native-fingerprint-scanner';

/**
 * Retrieve biometric settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of react-native-fingerprint-scanner library and simplifies the possible returned values in
 * function of its usage.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner
 */

const biometricErrors = [
  // possibly working, but the string returned is undocumented
  'UNKNOWN',

  // unspeakable horrors happened somewhere under the hood
  'UNAVAILABLE'
] as const;

export type BiometricsErrorType = (typeof biometricErrors)[number];

export type BiometricsValidType =
  // happy path
  'BIOMETRICS' | 'FACE_ID' | 'TOUCH_ID';

export type BiometricsType = BiometricsErrorType | BiometricsValidType;

/**
 * Retrieve biometric settings from the base system. This function wraps the basic
 * method "isSensorAvailable" of react-native-fingerprint-scanner library and simplifies the possible returned values in
 * function of its usage.
 *
 * More info about library can be found here: https://github.com/hieuvp/react-native-fingerprint-scanner
 */
export const getBiometricsType = (): Promise<BiometricsType> =>
  FingerprintScanner.isSensorAvailable()
    .then((biometryType: Biometrics) => {
      switch (biometryType) {
        case 'Touch ID':
          return 'TOUCH_ID';
        case 'Face ID':
          return 'FACE_ID';
        case 'Biometrics':
          return 'BIOMETRICS';
        default:
          return 'UNKNOWN';
      }
    })
    .catch(_ => 'UNAVAILABLE');

export const isBiometricsValidType = (
  biometrics: BiometricsType
): biometrics is BiometricsValidType =>
  !biometricErrors.some(err => biometrics === err);

// CURRENTLY UNUSED BUT KEPT FOR FUTURE REFERENCE
// export const biometricAuthenticationRequest = (
//   onSuccess: () => void,
//   onError: (e: FingerprintScannerError) => void
// ): Promise<void> =>
//   FingerprintScanner.authenticate(
//     Platform.select({
//       ios: {
//         description: t('identification.biometric.popup.sensorDescription'),
//         fallbackEnabled: false
//       } as AuthenticateIOS,
//       default: {
//         title: t('identification.biometric.popup.title'),
//         description: t('identification.biometric.popup.sensorDescription'),
//         cancelButton: t('global.buttons.cancel')
//       } as AuthenticateAndroid
//     })
//   )
//     .then(() => {
//       onSuccess();
//       // We need to explicitly release the listener to avoid bugs on android platform
//       void FingerprintScanner.release();
//     })
//     .catch((e: FingerprintScannerError) => {
//       onError(e);
//       // We need to explicitly release the listener to avoid bugs on android platform
//       void FingerprintScanner.release();
//     });

export type BiometricState = 'Available' | 'NotEnrolled' | 'NotSupported';

export const getBiometricState = (): Promise<BiometricState> =>
  new Promise(resolve => {
    FingerprintScanner.isSensorAvailable()
      .then(_ => {
        resolve('Available');
      })
      .catch(e => {
        const error = e as FingerprintScannerError;
        if (error.name === 'FingerprintScannerNotEnrolled') {
          resolve('NotEnrolled');
        } else {
          resolve('NotSupported');
        }
      });
  });

export const hasDeviceScreenLock = (): Promise<boolean> =>
  new Promise(resolve => {
    isPinOrFingerprintSet()
      .then(value => {
        resolve(value);
      })
      .catch(_ => {
        resolve(false);
      });
  });

export type BiometriActivationUserType =
  | 'ACTIVATED'
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'SENSOR_ERROR';

const mayUserActivateBiometricWithDependency = (
  getBiometricsType: Promise<BiometricsType>,
  description: string
): Promise<BiometriActivationUserType> =>
  new Promise((resolve, reject) => {
    getBiometricsType
      .then(value => {
        if (value === 'FACE_ID') {
          FingerprintScanner.authenticate({
            description,
            fallbackEnabled: false
          } as AuthenticateIOS)
            .then(_ => resolve('ACTIVATED'))
            .catch((err: Errors) => {
              reject(handleErrorDuringBiometricActivation(err));
            });
        } else {
          resolve('ACTIVATED');
        }
      })
      .catch(_ => {
        reject('SENSOR_ERROR');
      });
  });

export const mayUserActivateBiometric = (description: string) =>
  mayUserActivateBiometricWithDependency(getBiometricsType(), description);

export const biometricFunctionForTests = {
  mayUserActivateBiometricWithDependency
};

function handleErrorDuringBiometricActivation(
  err: Errors
): BiometriActivationUserType {
  if (err.name === 'FingerprintScannerNotAvailable') {
    return 'PERMISSION_DENIED';
  }
  return 'AUTH_FAILED';
}
