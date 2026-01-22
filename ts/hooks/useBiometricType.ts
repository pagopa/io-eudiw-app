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
    if (isBiometricEnabled) {
      LocalAuthentication.supportedAuthenticationTypesAsync()
        .then(types => setBiometricType(types[0]))
        .catch(() => null);
    }
  }, [isBiometricEnabled]);

  return { biometricType, isBiometricEnabled };
};
