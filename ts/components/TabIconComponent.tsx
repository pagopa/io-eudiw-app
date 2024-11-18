import {ColorValue, View} from 'react-native';
import React from 'react';
import {AnimatedIcon, IONavIcons} from '@pagopa/io-app-design-system';

type TabIconComponent = {
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
  color?: ColorValue;
};

/**
 * Component which wraps an animated icon to be used as a tab icon in a tab navigator.
 * @param focused - Whether the tab is focused
 * @param iconName - The icon name when the tab is not focused
 * @param iconNameFocused - The icon name when the tab is focused
 * @param color - The color of the icon
 */
export const TabIconComponent = React.memo(
  ({focused, iconName, iconNameFocused, color}: TabIconComponent) => (
    // accessibilityLabel={""} in order to read the font icon, without modify the library element
    <View accessibilityLabel={''}>
      <AnimatedIcon
        name={focused ? iconNameFocused : iconName}
        size={24}
        color={color}
      />
    </View>
  )
);
