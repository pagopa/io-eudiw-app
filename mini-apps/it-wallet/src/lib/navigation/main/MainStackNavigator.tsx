import { NavigatorScreenParams, PathConfigMap } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import QrCodeScanScreen from '../../screens/presentation/QrCodeScanScreen';
import ItwBluetoothActivationScreen from '../../screens/proximity/ItwBluetoothActivationScreen';
import ItwBluetoothPermissionsScreen from '../../screens/proximity/ItwBluetoothPermissionsScreen';
import ItwNfcActivationScreen from '../../screens/proximity/ItwNfcActivationScreen';
import ItwProximityNfcPresentment from '../../screens/proximity/ItwProximityNfcPresentment';
import ItwProximityPresentmentScreen from '../../screens/proximity/ItwProximityPresentmentScreen';
import Appearance from '../../screens/settings/Appearance';
import Preference from '../../screens/settings/Preferences';
import { ProximityConsents } from '../../screens/settings/ProximityConsents';
import Settings from '../../screens/settings/Settings';
// Internal Imports
import { TabNavigator } from '../tab/TabNavigator';
import WalletNavigator, {
  WalletNavigatorParamsList
} from '../wallet/WalletNavigator';
import MAIN_ROUTES from './routes';

/**
 * Screen parameters for the main navigator.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.BLE_PRESENTMENT]: undefined;
  [MAIN_ROUTES.NFC_PRESENTMENT]: undefined;
  [MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION]: undefined;
  [MAIN_ROUTES.PROXIMITY_BLUETOOTH_PERMISSIONS]: undefined;
  [MAIN_ROUTES.PROXIMITY_NFC_ACTIVATION]: undefined;
  [MAIN_ROUTES.SCAN_QR]: undefined;
  [MAIN_ROUTES.SETTINGS.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PROXIMITY]: undefined;
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET_NAV]: NavigatorScreenParams<WalletNavigatorParamsList>;
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
    <Stack.Screen component={TabNavigator} name={MAIN_ROUTES.TAB_NAV} />

    <Stack.Screen component={WalletNavigator} name={MAIN_ROUTES.WALLET_NAV} />

    <Stack.Screen
      component={QrCodeScanScreen}
      name={MAIN_ROUTES.SCAN_QR}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      component={ItwProximityPresentmentScreen}
      name={MAIN_ROUTES.BLE_PRESENTMENT}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      component={ItwProximityNfcPresentment}
      name={MAIN_ROUTES.NFC_PRESENTMENT}
      options={{ animation: 'slide_from_bottom' }}
    />

    <Stack.Screen
      component={ItwBluetoothPermissionsScreen}
      name={MAIN_ROUTES.PROXIMITY_BLUETOOTH_PERMISSIONS}
    />

    <Stack.Screen
      component={ItwBluetoothActivationScreen}
      name={MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION}
    />

    <Stack.Screen
      component={ItwNfcActivationScreen}
      name={MAIN_ROUTES.PROXIMITY_NFC_ACTIVATION}
    />

    <Stack.Screen component={Settings} name={MAIN_ROUTES.SETTINGS.MAIN} />
    <Stack.Screen
      component={Preference}
      name={MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN}
    />
    <Stack.Screen
      component={Appearance}
      name={MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE}
    />
    <Stack.Screen
      component={ProximityConsents}
      name={MAIN_ROUTES.SETTINGS.PROXIMITY}
    />
  </Stack.Navigator>
);
