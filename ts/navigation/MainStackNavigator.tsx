import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import OnboardingNavigator from '../features/onboarding/navigation/OnboardingNavigator';
import {useAppSelector} from '../store';
import {selectisOnboardingComplete} from '../features/onboarding/store/reducer';
import {TabNavigation} from './TabNavigator';
import ROUTES from './utils/routes';

/**
 * MainStackNav parameters list for each defined screen.
 */
export type MainStackNavParamList = {
  [ROUTES.MAIN.HOME]: undefined;
  [ROUTES.MAIN.ONBOARDING]: undefined;
};

const Stack = createNativeStackNavigator<MainStackNavParamList>();

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
