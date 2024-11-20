import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useIOThemeContext} from '@pagopa/io-app-design-system';
import OnboardingNavigator from '../features/onboarding/navigation/OnboardingNavigator';
import {useAppDispatch, useAppSelector} from '../store';
import {selectStartupState, startupSetLoading} from '../store/reducers/startup';
import ONBOARDING_ROUTES from '../features/onboarding/navigation/routes';
import {selectisOnboardingComplete} from '../store/reducers/preferences';
import {TabNavigation} from './TabNavigator';
import ROUTES from './routes';
import {RootStackParamList} from './params';
import {IONavigationDarkTheme, IONavigationLightTheme} from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Entry point stack navigator for the application. This is the main navigation which orchestrates the whole app navigation.
 * It checks if the onboarding is not completed and shows the onboarding navigator, otherwise it shows the main tab navigator.
 */
export const RootStackNavigator = () => {
  const isStartupDone = useAppSelector(selectStartupState);
  const isOnboardingCompleted = useAppSelector(selectisOnboardingComplete);
  const {themeType} = useIOThemeContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(startupSetLoading());
  }, []);

  return (
    <NavigationContainer
      theme={
        themeType === 'light' ? IONavigationLightTheme : IONavigationDarkTheme
      }>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {
          // Startup is done, render the home screen or onboarding navigator
          isStartupDone === 'DONE' &&
            (isOnboardingCompleted ? (
              // Onboarding is completed, render the home screen
              <Stack.Screen name={ROUTES.MAIN_HOME} component={TabNavigation} />
            ) : (
              // Onboarding not completed, render the onboarding navigator
              <Stack.Screen
                name={ONBOARDING_ROUTES.MAIN}
                component={OnboardingNavigator}
              />
            ))
        }

        {
          // Startup failed, render the error screen
          isStartupDone === 'ERROR' && (
            <Stack.Screen
              name={ROUTES.MAIN_ERROR}
              component={() => (
                <View>
                  <Text>Error</Text>
                </View>
              )}
            />
          )
        }

        {
          // Startup is loading or not started, render the loading screen
          (isStartupDone === 'LOADING' || isStartupDone === 'NOT_STARTED') && (
            <Stack.Screen
              name={ROUTES.MAIN_LOADING}
              component={() => (
                <View>
                  <Text>Loading</Text>
                </View>
              )}
            />
          )
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
};
