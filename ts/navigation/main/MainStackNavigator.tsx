import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TabNavigator } from '../tab/TabNavigator';
import WalletNavigator, {
  WalletNavigatorParamsList
} from '../../features/wallet/navigation/WalletNavigator';
import Settings from '../../screens/Settings';
import QrCodeScanScreen from '../../features/qrcode/scan/screens/QrCodeScanScreen';
import ProximityQrCode from '../../features/wallet/screens/proximity/ProximityQrCode';
import MAIN_ROUTES from './routes';
/**
 * Screen parameters for the main navigator.
 * New screens should be added here along with their parameters.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET_NAV]: NavigatorScreenParams<WalletNavigatorParamsList>;
  [MAIN_ROUTES.SETTINGS]: undefined;
  [MAIN_ROUTES.SCAN_QR]: undefined;
  [MAIN_ROUTES.SHOW_QR]: undefined;
};

const Stack = createNativeStackNavigator<MainNavigatorParamsList>();

/**
 * The main stack navigator which renders screen after the onboarding has been completed.
 * It mounts the tab navigator and any other inner navigator.
 */
const MainStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.TAB_NAV}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name={MAIN_ROUTES.TAB_NAV} component={TabNavigator} />
    <Stack.Screen name={MAIN_ROUTES.WALLET_NAV} component={WalletNavigator} />
    <Stack.Screen
      name={MAIN_ROUTES.SCAN_QR}
      component={QrCodeScanScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name={MAIN_ROUTES.SHOW_QR}
      component={ProximityQrCode}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen name={MAIN_ROUTES.SETTINGS} component={Settings} />
  </Stack.Navigator>
);

export default MainStackNavigator;
