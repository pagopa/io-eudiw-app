import { createStackNavigator } from '@react-navigation/stack';

import ItwBluetoothActivationScreen from '../../screens/proximity/ItwBluetoothActivationScreen';
import ItwBluetoothPermissionsScreen from '../../screens/proximity/ItwBluetoothPermissionsScreen';
import ItwNfcActivationScreen from '../../screens/proximity/ItwNfcActivationScreen';
import ItwProximityNfcPresentment from '../../screens/proximity/ItwProximityNfcPresentment';
import ItwProximityPresentmentScreen from '../../screens/proximity/ItwProximityPresentmentScreen';
import ItwProximityStoreConsent from '../../screens/proximity/ItwProximityStoreConsent';
import PresentationProximityFailure, {
  PresentationProximityFailureProps
} from '../../screens/proximity/PresentationProximityFailure';
import PresentationProximityPreview from '../../screens/proximity/PresentationProximityPreview';
import PresentationProximitySuccess from '../../screens/proximity/PresentationProximitySuccess';
import PROXIMITY_ROUTES from './routes';

export type ProximityNavigatorParamsList = {
  [PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION]: undefined;
  [PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS]: undefined;
  [PROXIMITY_ROUTES.FAILURE]: PresentationProximityFailureProps;
  [PROXIMITY_ROUTES.NFC_ACTIVATION]: undefined;
  [PROXIMITY_ROUTES.NFC_PRESENTMENT]: undefined;
  [PROXIMITY_ROUTES.PREVIEW]: undefined;
  [PROXIMITY_ROUTES.QR_PRESENTMENT]: undefined;
  [PROXIMITY_ROUTES.STORE_CONSENT]: undefined;
  [PROXIMITY_ROUTES.SUCCESS]: undefined;
};

const Stack = createStackNavigator<ProximityNavigatorParamsList>();

/**
 * Stack of the proximity presentation flow: hardware gates (Bluetooth / NFC),
 * engagement (QR code / NFC), claims preview and result.
 * Screens which need a header set it through `useHeaderSecondLevel`.
 */
const ProximityNavigator = () => (
  <Stack.Navigator
    initialRouteName={PROXIMITY_ROUTES.QR_PRESENTMENT}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      component={ItwBluetoothPermissionsScreen}
      name={PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS}
    />
    <Stack.Screen
      component={ItwBluetoothActivationScreen}
      name={PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION}
    />
    <Stack.Screen
      component={ItwNfcActivationScreen}
      name={PROXIMITY_ROUTES.NFC_ACTIVATION}
    />
    <Stack.Screen
      component={ItwProximityPresentmentScreen}
      name={PROXIMITY_ROUTES.QR_PRESENTMENT}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      component={ItwProximityNfcPresentment}
      name={PROXIMITY_ROUTES.NFC_PRESENTMENT}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      component={PresentationProximityPreview}
      name={PROXIMITY_ROUTES.PREVIEW}
    />
    <Stack.Screen
      component={ItwProximityStoreConsent}
      name={PROXIMITY_ROUTES.STORE_CONSENT}
    />
    <Stack.Screen
      component={PresentationProximitySuccess}
      name={PROXIMITY_ROUTES.SUCCESS}
    />
    <Stack.Screen
      component={PresentationProximityFailure}
      name={PROXIMITY_ROUTES.FAILURE}
    />
  </Stack.Navigator>
);

export default ProximityNavigator;
