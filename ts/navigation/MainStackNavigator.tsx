import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import OnboardingNavigator from '../features/onboarding/navigation/OnboardingNavigator';
import {useAppSelector} from '../store';
import {selectisOnboardingComplete} from '../features/onboarding/store/reducer';
import {TabNavigation} from './TabNavigator';
import ROUTES from './utils/routes';

/**
 * Screen parameters for the main stack navigator.
 * New screens should be added here along with their parameters.
 */
export type MainStackNavParamList = {
  [ROUTES.MAIN.HOME]: undefined;
  [ROUTES.MAIN.ONBOARDING]: undefined;
};

const Stack = createNativeStackNavigator<MainStackNavParamList>();

/**
 * Entry point stack navigator for the application. This is the main navigation which orchestrates the whole app navigation.
 * It checks if the onboarding is not completed and shows the onboarding navigator, otherwise it shows the main tab navigator.
 */
export const MainStackNavigator = () => {
  const isOnboardingCompleted = useAppSelector(selectisOnboardingComplete);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isOnboardingCompleted ? (
          <Stack.Screen name={ROUTES.MAIN.HOME} component={TabNavigation} />
        ) : (
          <Stack.Screen
            name={ROUTES.MAIN.ONBOARDING}
            component={OnboardingNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
