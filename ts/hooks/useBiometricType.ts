import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { selectIsBiometricEnabled } from '../store/reducers/preferences';

export const useBiometricType = () => {
  const isBiometricEnabled = useAppSelector(selectIsBiometricEnabled);

  const [biometricType, setBiometricType] = useState<
    LocalAuthentication.AuthenticationType | undefined
  >(undefined);

  const [hasHardware, setHasHardware] = useState<boolean>(false);

  useEffect(() => {
    if (!isBiometricEnabled) {
      setBiometricType(undefined);
      setHasHardware(false);
      return;
    }

    const checkBiometrics = async () => {
      try {
        const [hardwareSupported, enrolledLevel, supportedTypes] =
          await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.getEnrolledLevelAsync(),
            LocalAuthentication.supportedAuthenticationTypesAsync()
          ]);

        setHasHardware(hardwareSupported);

        if (
          hardwareSupported &&
          enrolledLevel !== LocalAuthentication.SecurityLevel.NONE &&
          supportedTypes.length > 0
        ) {
          setBiometricType(supportedTypes[0]);
        } else {
          setBiometricType(undefined);
        }
      } catch {
        setHasHardware(false);
        setBiometricType(undefined);
      }
    };

    void checkBiometrics();
  }, [isBiometricEnabled]);

  return {
    biometricType,
    isBiometricEnabled,
    hasHardware
  };
};
