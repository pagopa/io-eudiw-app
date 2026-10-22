import { createStackNavigator } from '@react-navigation/stack';

import { IdentificationMethod } from '../../screens/pidIssuance/IdentificationMethod';
import PidIssuanceFailure from '../../screens/pidIssuance/PidIssuanceFailure';
import PidIssuanceRequest from '../../screens/pidIssuance/PidIssuanceRequest';
import PidIssuanceResult from '../../screens/pidIssuance/PidIssuanceResult';
import { WalletInstanceCreation } from '../../screens/pidIssuance/WalletInstanceCreation';
import PID_ISSUANCE_ROUTES from './routes';

export type PidIssuanceNavigatorParamsList = {
  [PID_ISSUANCE_ROUTES.FAILURE]: undefined;
  [PID_ISSUANCE_ROUTES.ID_METHOD]: undefined;
  [PID_ISSUANCE_ROUTES.INSTANCE_CREATION]: undefined;
  [PID_ISSUANCE_ROUTES.REQUEST]: undefined;
  [PID_ISSUANCE_ROUTES.RESULT]: undefined;
};

const Stack = createStackNavigator<PidIssuanceNavigatorParamsList>();

/**
 * Stack of the PID issuance (IT-Wallet activation) flow.
 */
const PidIssuanceNavigator = () => (
  <Stack.Navigator initialRouteName={PID_ISSUANCE_ROUTES.INSTANCE_CREATION}>
    <Stack.Screen
      component={WalletInstanceCreation}
      name={PID_ISSUANCE_ROUTES.INSTANCE_CREATION}
    />
    <Stack.Screen
      component={IdentificationMethod}
      name={PID_ISSUANCE_ROUTES.ID_METHOD}
    />
    <Stack.Screen
      component={PidIssuanceRequest}
      name={PID_ISSUANCE_ROUTES.REQUEST}
    />
    <Stack.Screen
      component={PidIssuanceResult}
      name={PID_ISSUANCE_ROUTES.RESULT}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={PidIssuanceFailure}
      name={PID_ISSUANCE_ROUTES.FAILURE}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default PidIssuanceNavigator;
