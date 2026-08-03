import {
  getLuminance,
  HeaderSecondLevelHookProps
} from '@io-eudiw-app/commons';
import { useMemo } from 'react';
import { StatusBarStyle } from 'react-native';

import { getCredentialNameByType, wellKnownCredential } from './credentials';
import { useItWalletTheme } from './theme';

type CredentialTheme = {
  backgroundColor: string;
  statusBarStyle: StatusBarStyle;
  textColor: string;
  variant: HeaderSecondLevelHookProps['variant'];
};

export const useThemeColorByCredentialType = (
  credentialType: string,
  withL3Design?: boolean
): CredentialTheme => {
  const theme = useItWalletTheme();

  const colors = useMemo(() => {
    switch (credentialType) {
      case wellKnownCredential.BONUS_PARI:
        return {
          backgroundColor: '#7AC1FA',
          textColor: '#000000'
        };
      case wellKnownCredential.DISABILITY_CARD:
        return {
          backgroundColor: '#315B76',
          textColor: '#17406F'
        };
      case wellKnownCredential.DRIVING_LICENSE:
        return {
          backgroundColor: withL3Design
            ? theme['header-background']
            : '#744C63',
          textColor: withL3Design ? '#032D5C' : '#652035'
        };
      case wellKnownCredential.PID:
      default:
        return {
          backgroundColor: withL3Design
            ? theme['header-background']
            : '#295699',
          textColor: '#032D5C'
        };
    }
  }, [credentialType, theme, withL3Design]);

  const isDarker = getLuminance(colors.backgroundColor) < 0.5;

  return {
    ...colors,
    // Return appropriate status bar style and header variant based on background color luminance
    statusBarStyle: isDarker ? 'light-content' : 'dark-content',
    variant: isDarker ? 'contrast' : 'neutral'
  };
};

export const useHeaderPropsByCredentialType = (
  credentialType: string,
  withL3Design: boolean
) => {
  const { backgroundColor, variant } = useThemeColorByCredentialType(
    credentialType,
    withL3Design
  );

  return {
    backgroundColor,
    title: getCredentialNameByType(credentialType),
    variant
  };
};
