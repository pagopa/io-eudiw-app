import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PidIssuanceResultError from '../screens/pidIssuance/PidIssuanceResultError';
import WalletInstanceCreation from '../screens/pidIssuance/WalletInstanceCreation';
import Authentication from '../screens/pidIssuance/Authentication';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.AUTHENTICATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.RESULT_ERROR]: undefined;
};

const Stack = createNativeStackNavigator<WalletNavigatorParamsList>();

/**
 * The wallted related stack which is used to navigate between wallet related screens.
 * It includes the pid issuance flow.
 */
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
    screenOptions={{headerShown: false}}>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
        component={WalletInstanceCreation}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.RESULT_ERROR}
        component={PidIssuanceResultError}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.AUTHENTICATION}
        component={Authentication}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
