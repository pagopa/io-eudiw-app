import { useIOThemeContext } from '@pagopa/io-app-design-system';
import { ColorSchemeName } from 'react-native';

import { getItWalletColorScheme, ItWalletThemes } from '../../../utils/theme';

export type CredentialCardConfig = {
  /**
   * Card background color. Every credential uses the same, generic
   * background: no credential-specific colors or gradients are applied.
   */
  background: string;
  /**
   * Color used for the card border when the credential is valid.
   */
  borderColor: string;
  /**
   * Color used for the credential title text.
   */
  titleColor: string;
};

/**
 * Single, generic card configuration shared by every credential type, varying
 * only based on the app color scheme (light/dark). No credential-specific
 * background, color or overlay is ever applied.
 */
const genericCredentialCardConfigs: Record<
  'dark' | 'light',
  CredentialCardConfig
> = {
  dark: {
    background: ItWalletThemes.dark['card-background'],
    borderColor: '#738899',
    titleColor: '#FFFFFF'
  },
  light: {
    background: ItWalletThemes.light['card-background'],
    borderColor: '#738899',
    titleColor: '#000000'
  }
};

/**
 * Returns the single, generic card configuration, based on the current app
 * color scheme (light/dark). The credential type has no influence on the
 * returned configuration.
 */
export const getCredentialCardConfig = (
  colorScheme: ColorSchemeName
): CredentialCardConfig =>
  genericCredentialCardConfigs[getItWalletColorScheme(colorScheme)];

/**
 * Custom hook to retrieve the generic credential card configuration, based on
 * the current app theme or an optional theme override.
 */
export const useCredentialCardConfig = (themeOverride?: ColorSchemeName) => {
  const { themeType } = useIOThemeContext();
  return getCredentialCardConfig(themeOverride ?? themeType);
};
