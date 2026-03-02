import { useMemo } from 'react';
import { StatusBarStyle } from 'react-native';
import { HeaderSecondLevelHookProps } from '../../../hooks/useHeaderSecondLevel';
import { getLuminance } from '../../../utils/color';
import { getCredentialNameByType, wellKnownCredential } from './credentials';
import { useItWalletTheme } from './theme';

type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
  variant: HeaderSecondLevelHookProps['variant'];
};

export const useThemeColorByCredentialType = (
  credentialType: string,
  withL3Design?: boolean
): CredentialTheme => {
  const theme = useItWalletTheme();

  const colors = useMemo(() => {
    switch (credentialType) {
      case wellKnownCredential.PID:
      default:
        return {
          backgroundColor: withL3Design
            ? theme['header-background']
            : '#295699',
          textColor: '#032D5C'
        };
      case wellKnownCredential.DRIVING_LICENSE:
        return {
          backgroundColor: withL3Design
            ? theme['header-background']
            : '#744C63',
          textColor: withL3Design ? '#032D5C' : '#652035'
        };
      case wellKnownCredential.DISABILITY_CARD:
        return {
          backgroundColor: '#315B76',
          textColor: '#17406F'
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
    title: getCredentialNameByType(credentialType),
    variant,
    backgroundColor
  };
};
