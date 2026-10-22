import { NavigatorScreenParams, PathConfigMap } from '@react-navigation/native';
import {
  createStackNavigator,
  TransitionPresets
} from '@react-navigation/stack';

import DeepLinkError, {
  DeepLinkErrorParams
} from '../../screens/deeplink/DeepLinkError';
import DeepLinkHandler, {
  DeepLinkHandlerParams
} from '../../screens/deeplink/DeepLinkHandler';
import {
  ItwPresentationCredentialCardModal,
  ItwPresentationCredentialCardModalNavigationParams
} from '../../screens/presentation/ItwPresentationCredentialCardModal';
import {
  ItwPresentationCredentialDetailNavigationParams,
  ItwPresentationCredentialDetailScreen
} from '../../screens/presentation/ItwPresentationCredentialDetailScreen';
import PresentationWalletNotActive, {
  PresentationWalletNotActiveParams
} from '../../screens/presentation/PresentationWalletNotActive';
import QrCodeScanScreen from '../../screens/presentation/QrCodeScanScreen';
import Appearance from '../../screens/settings/Appearance';
import Preference from '../../screens/settings/Preferences';
import { ProximityConsents } from '../../screens/settings/ProximityConsents';
import Settings from '../../screens/settings/Settings';
import CredentialIssuanceNavigator, {
  CredentialIssuanceNavigatorParamsList
} from '../credentialIssuance/CredentialIssuanceNavigator';
import PidIssuanceNavigator, {
  PidIssuanceNavigatorParamsList
} from '../pidIssuance/PidIssuanceNavigator';
import PresentationNavigator, {
  PresentationNavigatorParamsList
} from '../presentation/PresentationNavigator';
import ProximityNavigator, {
  ProximityNavigatorParamsList
} from '../proximity/ProximityNavigator';
import { TabNavigator } from '../tab/TabNavigator';
import MAIN_ROUTES from './routes';

/**
 * Screen parameters for the main navigator.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.CREDENTIAL_CARD_MODAL]: ItwPresentationCredentialCardModalNavigationParams;
  [MAIN_ROUTES.CREDENTIAL_DETAILS]: ItwPresentationCredentialDetailNavigationParams;
  [MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV]: NavigatorScreenParams<CredentialIssuanceNavigatorParamsList>;
  [MAIN_ROUTES.DEEP_LINK_ERROR]: DeepLinkErrorParams;
  [MAIN_ROUTES.DEEP_LINK_HANDLER]: DeepLinkHandlerParams;
  [MAIN_ROUTES.PID_ISSUANCE_NAV]: NavigatorScreenParams<PidIssuanceNavigatorParamsList>;
  [MAIN_ROUTES.PRESENTATION_NAV]: NavigatorScreenParams<PresentationNavigatorParamsList>;
  [MAIN_ROUTES.PROXIMITY_NAV]: NavigatorScreenParams<ProximityNavigatorParamsList>;
  [MAIN_ROUTES.SCAN_QR]: undefined;
  [MAIN_ROUTES.SETTINGS.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE]: undefined;
  [MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN]: undefined;
  [MAIN_ROUTES.SETTINGS.PROXIMITY]: undefined;
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET_NOT_ACTIVE]: PresentationWalletNotActiveParams;
};

/**
 * All supported deep link schemes resolve to the centralized {@link DeepLinkHandler}
 * screen. React Navigation strips the scheme before matching, so routing per
 * scheme (presentation vs. credential offer) is decided inside the handler by
 * reading the full URL from the deep linking slice.
 */
export const walletLinkingConfig: PathConfigMap<MainNavigatorParamsList> = {
  [MAIN_ROUTES.DEEP_LINK_HANDLER]: {
    path: ''
  }
};

const Stack = createStackNavigator<MainNavigatorParamsList>();

/**
 * The main stack navigator of the mini-app.
 * It hosts the tab navigator, the standalone screens and one nested stack for
 * each flow (PID issuance, credential issuance, remote and proximity
 * presentation).
 */
export const MainStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.TAB_NAV}
    screenOptions={{
      headerShown: false
    }}
  >
    <Stack.Screen component={TabNavigator} name={MAIN_ROUTES.TAB_NAV} />

    <Stack.Group>
      <Stack.Screen
        component={PidIssuanceNavigator}
        name={MAIN_ROUTES.PID_ISSUANCE_NAV}
      />
      <Stack.Screen
        component={CredentialIssuanceNavigator}
        name={MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV}
      />
      <Stack.Screen
        component={PresentationNavigator}
        name={MAIN_ROUTES.PRESENTATION_NAV}
      />
      <Stack.Screen
        component={ProximityNavigator}
        name={MAIN_ROUTES.PROXIMITY_NAV}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Group>

    <Stack.Group>
      <Stack.Screen
        component={DeepLinkHandler}
        name={MAIN_ROUTES.DEEP_LINK_HANDLER}
      />
      <Stack.Screen
        component={DeepLinkError}
        name={MAIN_ROUTES.DEEP_LINK_ERROR}
      />
      <Stack.Screen
        component={PresentationWalletNotActive}
        name={MAIN_ROUTES.WALLET_NOT_ACTIVE}
      />
      <Stack.Screen
        component={QrCodeScanScreen}
        name={MAIN_ROUTES.SCAN_QR}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Group>

    <Stack.Group>
      <Stack.Screen
        component={ItwPresentationCredentialDetailScreen}
        name={MAIN_ROUTES.CREDENTIAL_DETAILS}
      />
      <Stack.Screen
        component={ItwPresentationCredentialCardModal}
        name={MAIN_ROUTES.CREDENTIAL_CARD_MODAL}
        options={{
          gestureEnabled: false,
          headerShown: true,
          ...TransitionPresets.ModalSlideFromBottomIOS
        }}
      />
    </Stack.Group>

    <Stack.Group>
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
    </Stack.Group>
  </Stack.Navigator>
);
