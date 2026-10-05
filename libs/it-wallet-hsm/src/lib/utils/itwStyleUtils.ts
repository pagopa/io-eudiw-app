import {
  getLuminance,
  HeaderSecondLevelHookProps
} from '@io-eudiw-app/commons';
import { IOColors } from '@pagopa/io-app-design-system';
import { useMemo } from 'react';
import { StatusBarStyle } from 'react-native';

import { getCredentialNameByType } from './credentials';
import { useItWalletTheme } from './theme';

type CredentialTheme = {
  backgroundColor: string;
  statusBarStyle: StatusBarStyle;
  textColor: string;
  variant: HeaderSecondLevelHookProps['variant'];
};

/**
 * Returns a single, generic theme (background/text colors, status bar style
 * and header variant) used for every credential, regardless of its type.
 * The `withL3Design` flag is accepted for backward compatibility with
 * existing call sites but no longer changes the resulting colors, since no
 * credential-specific styling is applied anymore.
 */
export const useThemeColorByCredentialType = (
  _credentialType: string,
  _withL3Design?: boolean
): CredentialTheme => {
  const theme = useItWalletTheme();

  const colors = useMemo(
    () => ({
      backgroundColor: theme['header-background'],
      textColor: IOColors.black
    }),
    [theme]
  );

  const isDarker = getLuminance(colors.backgroundColor) < 0.5;

  return {
    ...colors,
    // Return appropriate status bar style and header variant based on background color luminance
    statusBarStyle: isDarker ? 'light-content' : 'dark-content',
    textColor: isDarker ? IOColors.white : IOColors.black,
    variant: isDarker ? 'contrast' : 'neutral'
  };
};

export const useHeaderPropsByCredentialType = (
  credentialType: string,
  withL3Design?: boolean
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
