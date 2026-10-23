import { selectFontPreference } from '@io-eudiw-app/preferences';
import { IOColors, makeFontStyleObject } from '@pagopa/io-app-design-system';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { TabIconComponent } from '../../components/TabIconComponent';
import WalletHome from '../../screens/WalletHome';
import { useAppSelector } from '../../store';
import TAB_ROUTES from './routes';

/**
 * Screen parameters for the tab navigator.
 * New screens should be added here along with their parameters.
 */
type TabNavigatorParamsList = {
  [TAB_ROUTES.SCAN_QR]: undefined;
  [TAB_ROUTES.WALLET]: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamsList>();

/**
 * Tab navigator which contains the main screens of the application.
 * It is used to navigate between the main screens of the application which are currently the home, scan qr and show qr screens.
 */
export const TabNavigator = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const navigation = useNavigation();

  const typefacePreference = useAppSelector(selectFontPreference);

  /**
   * Used to mock tab content. This will never be rendered.
   */
  const EmptyComponent = () => null;

  const navigateToQrCodeScanScreen = () => navigation.navigate('MAIN_SCAN_QR');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: IOColors['blueIO-500'],
        tabBarAllowFontScaling: false,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: IOColors['grey-850'],
        tabBarLabelStyle: makeFontStyleObject(
          11,
          typefacePreference === 'comfortable'
            ? 'Titillio'
            : 'TitilliumSansPro',
          14,
          'Regular'
        )
      }}
    >
      <Tab.Screen
        component={WalletHome}
        name={TAB_ROUTES.WALLET}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconComponent
              color={color}
              focused={focused}
              iconName={'navWallet'}
              iconNameFocused={'navWalletFocused'}
            />
          ),
          title: t('wallet:tabNavigator.wallet')
        }}
      />
      <Tab.Screen
        component={EmptyComponent}
        listeners={{
          tabPress: ({ preventDefault }) => {
            preventDefault();
            navigateToQrCodeScanScreen();
          }
        }}
        name={TAB_ROUTES.SCAN_QR}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIconComponent
              color={color}
              focused={focused}
              iconName={'navScan'}
              iconNameFocused={'navScan'}
            />
          ),
          title: t('wallet:tabNavigator.scanQr')
        }}
      />
    </Tab.Navigator>
  );
};
