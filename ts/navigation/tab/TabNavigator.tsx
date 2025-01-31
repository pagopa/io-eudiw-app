import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from 'react';
import {IOColors} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {TabIconComponent} from '../../components/TabIconComponent';
import WalletHome from '../../screens/WalletHome';
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
  const navigation = useNavigation();

  /**
   * Used to mock tab content. This will never be rendered.
   */
  const EmptyComponent = () => <></>;

  const navigateToQrCodeScanScreen = () =>
    navigation.navigate('ROOT_MAIN_NAV', {screen: 'MAIN_SCAN_QR'});

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
        component={WalletHome}
        options={{
          title: t('tabNavigator.wallet'),
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
        component={EmptyComponent}
        listeners={{
          tabPress: ({preventDefault}) => {
            preventDefault();
            navigateToQrCodeScanScreen();
          }
        }}
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
        component={EmptyComponent}
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
