import {
  IOColors,
  IOThemeDark,
  IOThemeLight
} from '@pagopa/io-app-design-system';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';

/**
 * React navigation dark theme.
 */
export const IONavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: IOColors[IOThemeDark['appBackground-primary']],
    card: IOColors[IOThemeDark['appBackground-primary']]
  }
};

/**
 * React navigation light theme.
 */
export const IONavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: IOColors[IOThemeLight['appBackground-primary']],
    card: IOColors[IOThemeLight['appBackground-primary']]
  }
};
