import {BiometricsValidType} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {Platform} from 'react-native';
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS,
  FingerprintScannerError
} from 'react-native-fingerprint-scanner';

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
        cancelButton: i18next.t('buttons.cancel', {ns: 'global'})
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
