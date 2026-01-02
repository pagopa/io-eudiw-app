import { BiometricsValidType } from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import { Platform } from 'react-native';
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  FingerprintScannerError
} from 'react-native-fingerprint-scanner';

/**
 * Returns the icon name based on the biometry type.
 * @param biometryPrintableSimpleType - The biometry type.
 * @returns The icon name.
 */
export const getBiometryIconName = (
  biometryPrintableSimpleType: BiometricsValidType
) => {
  switch (biometryPrintableSimpleType) {
    case 'BIOMETRICS':
    case 'TOUCH_ID':
      return i18next.t('identification.unlockCode.accessibility.fingerprint', {
        ns: 'global'
      });
    case 'FACE_ID':
      return i18next.t('identification.unlockCode.accessibility.faceId', {
        ns: 'global'
      });
  }
};

/**
 * Performs the biometric authentication request, calling the onSuccess callback if the authentication is successful, otherwise the onError callback.
 * @param onSuccess - The callback to be called if the authentication is successful.
 * @param onError - The callback to be called if the authentication fails.
 * @returns A promise that resolves when the authentication is completed.
 */
export const biometricAuthenticationRequest = (
  onSuccess: () => void,
  onError: (e: FingerprintScannerError) => void
): Promise<void> =>
  FingerprintScanner.authenticate(
    Platform.select({
      ios: {
        description: i18next.t('identification.biometric.sensorDescription', {
          ns: 'global'
        }),
        fallbackEnabled: false
      } as AuthenticateIOS,
      default: {
        title: i18next.t('identification.biometric.title', {
          ns: 'global'
        }),
        escription: i18next.t('identification.biometric.sensorDescription', {
          ns: 'global'
        }),
        cancelButton: i18next.t('buttons.cancel', { ns: 'global' })
      } as AuthenticateAndroid
    })
  )
    .then(() => {
      onSuccess();
      // We need to explicitly release the listener to avoid bugs on android platform
      void FingerprintScanner.release();
    })
    .catch((e: FingerprintScannerError) => {
      onError(e);
      // We need to explicitly release the listener to avoid bugs on android platform
      void FingerprintScanner.release();
    });
