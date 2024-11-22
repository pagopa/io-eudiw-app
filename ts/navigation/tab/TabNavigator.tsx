import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from 'react';
import {IOColors} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {Pressable, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TabIconComponent} from '../../components/TabIconComponent';
import {useAppDispatch} from '../../store';
import {preferencesReset} from '../../store/reducers/preferences';
import TAB_ROUTES from './routes';

/**
 * Screen parameters for the tab navigator.
 * New screens should be added here along with their parameters.
 */
export type TabNavigatorParamsList = {
  [TAB_ROUTES.WALLET]: undefined;
  [TAB_ROUTES.SCAN_QR]: undefined;
  [TAB_ROUTES.SHOW_QR]: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamsList>();

/**
 * Tab navigator which contains the main screens of the application.
 * It is used to navigate between the main screens of the application which are currently the home, scan qr and show qr screens.
 */
export const TabNavigator = () => {
  const {t} = useTranslation('global');
  const dispatch = useAppDispatch();

  // Prevents warning when passing it as inline function
  const EmptyScreen = () => (
    <SafeAreaView>
      <Pressable onPress={() => dispatch(preferencesReset())}>
        <Text>Reset Onboarding</Text>
      </Pressable>
    </SafeAreaView>
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
        name={TAB_ROUTES.WALLET}
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
        name={TAB_ROUTES.SCAN_QR}
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
        name={TAB_ROUTES.SHOW_QR}
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
