import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PidIssuanceFailure from '../screens/pidIssuance/PidIssuanceFailure';
import WalletInstanceCreation from '../screens/pidIssuance/WalletInstanceCreation';
import PidIssuancRequest from '../screens/pidIssuance/PidIssuanceRequest';
import PidIssuanceSuccess from '../screens/pidIssuance/PidIssuanceSuccess';
import {
  PresentationCredentialDetailNavigationParams,
  PresentationCredentialDetails
} from '../screens/presentation/PresentationCredentialDetails';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.REQUEST]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.SUCCESS]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.FAILURE]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_DETAILS]: PresentationCredentialDetailNavigationParams;
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
        name={WALLET_ROUTES.PID_ISSUANCE.FAILURE}
        component={PidIssuanceFailure}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.REQUEST}
        component={PidIssuancRequest}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.SUCCESS}
        component={PidIssuanceSuccess}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS}
        component={PresentationCredentialDetails}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
