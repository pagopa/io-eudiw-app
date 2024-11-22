import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigatorScreenParams} from '@react-navigation/native';
import {TabNavigator} from '../tab/TabNavigator';
import WalletNavigator, {
  WalletNavigatorParamsList
} from '../../features/wallet/navigation/WalletNavigator';
import MAIN_ROUTES from './routes';

/**
 * Screen parameters for the main navigator.
 * New screens should be added here along with their parameters.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET]: NavigatorScreenParams<WalletNavigatorParamsList>;
};

const Stack = createNativeStackNavigator<MainNavigatorParamsList>();

/**
 * The onboarding navigator contains all the screens and nested navigator which should be shown
 * after the onboarding is completed.
 */
const MainStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.TAB_NAV}
    screenOptions={{headerShown: false}}>
    <Stack.Screen name={MAIN_ROUTES.TAB_NAV} component={TabNavigator} />
    <Stack.Screen name={MAIN_ROUTES.WALLET} component={WalletNavigator} />
  </Stack.Navigator>
);

export default MainStackNavigator;
