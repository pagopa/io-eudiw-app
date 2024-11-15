import {ColorValue, View} from 'react-native';
import React from 'react';
import {AnimatedIcon, IONavIcons} from '@pagopa/io-app-design-system';

type TabIconComponent = {
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
  color?: ColorValue;
};

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
