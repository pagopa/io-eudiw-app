import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Discovery from '../screens/pidIssuance/WalletInstanceCreation';

import PidIssuanceResultError from '../screens/pidIssuance/PidIssuanceResultError';
import StrongAuthentication from '../screens/pidIssuance/StrongAuthentication';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.PID_ISSUANCE.DISCOVERY]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.RESULT_ERROR]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.STRONG_AUTHENTICATION]: undefined;
};

const Stack = createNativeStackNavigator<WalletNavigatorParamsList>();

/**
 * The wallted related stack which is used to navigate between wallet related screens.
 * It includes the pid issuance flow.
 */
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROUTES.PID_ISSUANCE.DISCOVERY}
    screenOptions={{headerShown: false}}>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.DISCOVERY}
        component={Discovery}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.RESULT_ERROR}
        component={PidIssuanceResultError}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.STRONG_AUTHENTICATION}
        component={StrongAuthentication}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
