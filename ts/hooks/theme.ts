import {IOColors, useIOTheme} from '@pagopa/io-app-design-system';

/**
 * Hook to get the app background color theme.
 */
export const useAppBackgroundAccentColor = (): IOColors => {
  const theme = useIOTheme();
  return theme['appBackground-accent'];
};

/**
 * Hook to get the app background color name.
 */
export const useAppBackgroundAccentColorName = (): string => {
  const color = useAppBackgroundAccentColor();
  return IOColors[color];
};

/**
 * Hook to get the interactive element default color theme.
 */
export const useInteractiveElementDefaultColor = (): IOColors => {
  const theme = useIOTheme();
  return theme['interactiveElem-default'];
};

/**
 * Hook to get the interactive element default color name.
 */
export const useInteractiveElementDefaultColorName = (): string => {
  const color = useInteractiveElementDefaultColor();
  return IOColors[color];
};
