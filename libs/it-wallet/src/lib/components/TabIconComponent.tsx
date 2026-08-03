import { AnimatedIcon, IONavIcons } from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { ColorValue, View } from 'react-native';

type TabIconComponentProps = {
  color?: ColorValue;
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
};

/**
 * Component which wraps an animated icon to be used as a tab icon in a tab navigator.
 * @param focused - Whether the tab is focused
 * @param iconName - The icon name when the tab is not focused
 * @param iconNameFocused - The icon name when the tab is focused
 * @param color - The color of the icon
 */
export const TabIconComponent = memo(
  ({ color, focused, iconName, iconNameFocused }: TabIconComponentProps) => (
    // accessibilityLabel={""} in order to read the font icon, without modify the library element
    <View accessibilityLabel={''} pointerEvents="none">
      <AnimatedIcon
        color={color}
        name={focused ? iconNameFocused : iconName}
        size={24}
      />
    </View>
  )
);
