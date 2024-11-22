import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TabNavigator} from '../tab/TabNavigator';
import MAIN_ROUTES from './routes';

/**
 * Screen parameters for the main navigator.
 * New screens should be added here along with their parameters.
 */
export type MainNavigatorParamsList = {
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET]: undefined;
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
  </Stack.Navigator>
);

export default MainStackNavigator;
