import { NavigatorScreenParams, PathConfigMap } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Internal Imports
import { TabNavigator } from '../tab/TabNavigator';
import MAIN_ROUTES from './routes';
import WalletNavigator, {
  WalletNavigatorParamsList
} from '../wallet/WalletNavigator';
import QrCodeScanScreen from '../../screens/presentation/QrCodeScanScreen';
import ItwProximityPresentmentScreen from '../../screens/proximity/ItwProximityPresentmentScreen';
import ItwProximityNfcPresentment from '../../screens/proximity/ItwProximityNfcPresentment';
import ItwBluetoothPermissionsScreen from '../../screens/proximity/ItwBluetoothPermissionsScreen';
import ItwBluetoothActivationScreen from '../../screens/proximity/ItwBluetoothActivationScreen';
import ItwNfcActivationScreen from '../../screens/proximity/ItwNfcActivationScreen';
import Settings from '../../screens/settings/Settings';
import Preference from '../../screens/settings/Preferences';
import Appearance from '../../screens/settings/Appearance';

/**
 * Screen parameters for the main navigator.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET_NAV]: NavigatorScreenParams<WalletNavigatorParamsList>;
  [MAIN_ROUTES.SETTINGS.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE]: undefined;
  [MAIN_ROUTES.SCAN_QR]: undefined;
  [MAIN_ROUTES.BLE_PRESENTMENT]: undefined;
  [MAIN_ROUTES.NFC_PRESENTMENT]: undefined;
  [MAIN_ROUTES.PROXIMITY_BLUETOOTH_PERMISSIONS]: undefined;
  [MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION]: undefined;
  [MAIN_ROUTES.PROXIMITY_NFC_ACTIVATION]: undefined;
};

/**
 * All supported deep link schemes resolve to the centralized {@link DeepLinkHandler}
 * screen. React Navigation strips the scheme before matching, so routing per
 * scheme (presentation vs. credential offer) is decided inside the handler by
 * reading the full URL from the deep linking slice.
 */
export const walletLinkingConfig: PathConfigMap<MainNavigatorParamsList> = {
  [MAIN_ROUTES.WALLET_NAV]: {
    screens: {
      DEEP_LINK_HANDLER: {
        path: ''
      }
    }
  }
};

const Stack = createStackNavigator<MainNavigatorParamsList>();

/**
 * The main stack navigator.
 * Handles async i18n initialization before rendering the navigation tree.
 */
export const MainStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.TAB_NAV}
    screenOptions={{
      headerShown: false
    }}
  >
    <Stack.Screen name={MAIN_ROUTES.TAB_NAV} component={TabNavigator} />

    <Stack.Screen name={MAIN_ROUTES.WALLET_NAV} component={WalletNavigator} />

    <Stack.Screen
      name={MAIN_ROUTES.SCAN_QR}
      component={QrCodeScanScreen}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      name={MAIN_ROUTES.BLE_PRESENTMENT}
      component={ItwProximityPresentmentScreen}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      name={MAIN_ROUTES.NFC_PRESENTMENT}
      component={ItwProximityNfcPresentment}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      name={MAIN_ROUTES.PROXIMITY_BLUETOOTH_PERMISSIONS}
      component={ItwBluetoothPermissionsScreen}
    />

    <Stack.Screen
      name={MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION}
      component={ItwBluetoothActivationScreen}
    />

    <Stack.Screen
      name={MAIN_ROUTES.PROXIMITY_NFC_ACTIVATION}
      component={ItwNfcActivationScreen}
    />

    <Stack.Screen name={MAIN_ROUTES.SETTINGS.MAIN} component={Settings} />
    <Stack.Screen
      name={MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN}
      component={Preference}
    />
    <Stack.Screen
      name={MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE}
      component={Appearance}
    />
  </Stack.Navigator>
);
