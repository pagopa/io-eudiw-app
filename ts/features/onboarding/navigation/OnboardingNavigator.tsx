import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ROUTES from '../../../navigation/utils/routes';
import TestScreen from '../screens/TestScreen';

const Stack = createNativeStackNavigator();

/**
 * The onboarding related stack which is used to navigate between onboarding screens on the first app launch.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING.TEST}
    screenOptions={{gestureEnabled: false}}>
    <Stack.Screen
      name={ROUTES.ONBOARDING.TEST}
      component={TestScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
