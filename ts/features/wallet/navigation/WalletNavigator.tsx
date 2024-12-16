import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Failure from '../screens/pidIssuance/Failure';
import WalletInstanceCreation from '../screens/pidIssuance/WalletInstanceCreation';
import Issuance from '../screens/pidIssuance/Issuance';
import Success from '../screens/pidIssuance/Success';
import IssuanceList from '../screens/credentialIssuance/IssuanceList';
import {lifecycleIsValidSelector} from '../store/lifecycle';
import {useAppSelector} from '../../../store';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.ISSUANCE]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.SUCCESS]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.FAILURE]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST]: undefined;
};

const Stack = createNativeStackNavigator<WalletNavigatorParamsList>();

/**
 * The wallted related stack which is used to navigate between wallet related screens.
 * It includes the pid issuance flow.
 */
const WalletNavigator = () => {
  const isWalletValid = useAppSelector(lifecycleIsValidSelector);

  return (
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
          component={Failure}
        />
        <Stack.Screen
          name={WALLET_ROUTES.PID_ISSUANCE.ISSUANCE}
          component={Issuance}
        />
        <Stack.Screen
          name={WALLET_ROUTES.PID_ISSUANCE.SUCCESS}
          component={Success}
        />
        {
          /**
           * Screen which should be mounted only if the wallet is valid.
           */
          isWalletValid && (
            <Stack.Screen
              name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST}
              component={IssuanceList}
            />
          )
        }
      </Stack.Group>
    </Stack.Navigator>
  );
};
export default WalletNavigator;
