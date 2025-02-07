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
import PresentationPreDefinition, {
  PresentationPreDefinitionParams
} from '../screens/presentation/PresentationPreDefinition';
import PresentationFailure from '../screens/presentation/PresentationFailure';
import PresentationPostDefinition, {
  PresentationPostDefinitionParams
} from '../screens/presentation/PresentationPostDefinition';
import PresentationSuccess from '../screens/presentation/PresentationSuccess';
import SelectCredential from '../screens/credentialIssuance/SelectCredential';
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
  [WALLET_ROUTES.PRESENTATION.PRE_DEFINITION]: PresentationPreDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.FAILURE]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .POST_DEFINITION]: PresentationPostDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.SUCCESS]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.SELECT_CREDENTIAL]: undefined;
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
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.PRE_DEFINITION}
        component={PresentationPreDefinition}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.FAILURE}
        component={PresentationFailure}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.POST_DEFINITION}
        component={PresentationPostDefinition}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.SUCCESS}
        component={PresentationSuccess}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.SELECT_CREDENTIAL}
        component={SelectCredential}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
