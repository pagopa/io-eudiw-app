import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Discovery from '../screens/pidIssuance/Discovery';

import PidIssuanceResultError, {
  PidIssuanceResultErrorNavigationParams
} from '../screens/pidIssuance/PidIssuanceResultError';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the onboarding navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.PID_ISSUANCE.DISCOVERY]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE
    .RESULT_ERROR]: PidIssuanceResultErrorNavigationParams;
};

const Stack = createNativeStackNavigator<WalletNavigatorParamsList>();

/**
 * The onboarding related stack which is used to navigate between onboarding screens on the first app launch.
 * It includes the initial carousel screen, the start screen, the PIN creation screen and the biometric screens.
 * The three biometric screens are shown based on the device's biometric capabilities and the user's settings.
 */
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROUTES.PID_ISSUANCE.DISCOVERY}
    screenOptions={{headerShown: false}}>
    <Stack.Screen
      name={WALLET_ROUTES.PID_ISSUANCE.DISCOVERY}
      component={Discovery}
    />
    <Stack.Screen
      name={WALLET_ROUTES.PID_ISSUANCE.RESULT_ERROR}
      component={PidIssuanceResultError}
    />
  </Stack.Navigator>
);

export default WalletNavigator;
