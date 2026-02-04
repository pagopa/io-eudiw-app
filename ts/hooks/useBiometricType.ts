import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { selectIsBiometricEnabled } from '../store/reducers/preferences';

/**
 * Hook to get the biometric type if it's enabled.
 * @returns the biometric type and the biometric enabled status.
 */
export const useBiometricType = () => {
  const isBiometricEnabled = useAppSelector(selectIsBiometricEnabled);
  const [biometricType, setBiometricType] = useState<
    LocalAuthentication.AuthenticationType | undefined
  >(undefined);

  useEffect(() => {
    const checkBiometrics = async () => {
      /* In order to understand if biometric authentication is available, the permission has been granted and the user has at least one biometric enrolled,
       * we must combine multiple data:
       * - isBiometricEnabled from our redux store (user preference)
       * - hasHardwareAsync which tells if the device has biometric hardware and on iOS returns false also if the permission has not been granted
       * - isEnrolledAsync which tells if the user has at least one biometric enrolled
       * - supportedAuthenticationTypesAsync which tells the available biometric types
       */
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync()
      ]);

      if (isBiometricEnabled && hasHardware && isEnrolled) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricType(types.length > 0 ? types[0] : undefined);
      }
    };

    checkBiometrics().catch(() => setBiometricType(undefined));
  }, [isBiometricEnabled]);

  return { biometricType };
};
