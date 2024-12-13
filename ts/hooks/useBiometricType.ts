import * as React from 'react';
import {BiometricsValidType} from '@pagopa/io-app-design-system';
import {useAppSelector} from '../store';
import {selectIsBiometricEnabled} from '../store/reducers/preferences';
import {
  getBiometricsType,
  isBiometricsValidType
} from '../features/onboarding/utils/biometric';

/**
 * Hook to get the biometric type if it's enabled.
 * @returns the biometric type and the biometric enabled status.
 */
export const useBiometricType = () => {
  const isFingerprintEnabled = useAppSelector(selectIsBiometricEnabled);

  const [biometricType, setBiometricType] = React.useState<
    BiometricsValidType | undefined
  >(undefined);
  React.useEffect(() => {
    if (isFingerprintEnabled) {
      getBiometricsType().then(
        biometricsType =>
          setBiometricType(
            isBiometricsValidType(biometricsType) ? biometricsType : undefined
          ),
        _ => 0
      );
    }
  }, [isFingerprintEnabled]);

  return {biometricType, isFingerprintEnabled};
};
