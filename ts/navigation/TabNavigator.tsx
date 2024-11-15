import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from 'react';
import {IOColors} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {Pressable, Text, View} from 'react-native';
import {TabIconComponent} from '../components/TabIconComponent';
import {onboardingReset} from '../features/onboarding/store/reducer';
import {useAppDispatch} from '../store';
import ROUTES from './utils/routes';

export type MainTabParamsList = {
  [ROUTES.MAIN.HOME]: undefined;
  [ROUTES.MAIN.SCAN_QR]: undefined;
  [ROUTES.MAIN.SHOW_QR]: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamsList>();

export const TabNavigation = () => {
  const {t} = useTranslation('main');
  const dispatch = useAppDispatch();

  // Prevents warning when passing it as inline function
  const EmptyScreen = () => (
    <View>
      <Pressable onPress={() => dispatch(onboardingReset())}>
        <Text>Reset Onboarding</Text>
      </Pressable>
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: IOColors['blueIO-500'],
        tabBarInactiveTintColor: IOColors['grey-850']
      }}>
      <Tab.Screen
        name={ROUTES.MAIN.HOME}
        component={EmptyScreen}
        options={{
          title: t('tabNavigator.home'),
          tabBarIcon: ({color, focused}) => (
            <TabIconComponent
              iconName={'navWallet'}
              iconNameFocused={'navWalletFocused'}
              color={color}
              focused={focused}
            />
          )
        }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.SCAN_QR}
        component={EmptyScreen}
        options={{
          title: t('tabNavigator.scanQr'),
          tabBarIcon: ({color, focused}) => (
            <TabIconComponent
              iconName={'navScan'}
              iconNameFocused={'navScan'}
              color={color}
              focused={focused}
            />
          )
        }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.SHOW_QR}
        component={EmptyScreen}
        options={{
          title: t('tabNavigator.showQr'),
          tabBarIcon: ({color, focused}) => (
            <TabIconComponent
              iconName={'navQrWallet'}
              iconNameFocused={'navQrWallet'}
              color={color}
              focused={focused}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};
