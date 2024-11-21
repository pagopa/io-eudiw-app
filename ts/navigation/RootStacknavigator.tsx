import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
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
 * Type definition for the screens to be rendered based on the startup and onboarding states.
 */
type Screens = {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
};

/**
 * Entry point stack navigator for the application. This is the main navigation which orchestrates the whole app navigation.
 * It's based on the startup state and the onboarding completion state and renders the appropriate screen based on these states.
 */
export const RootStackNavigator = () => {
  const isStartupDone = useAppSelector(selectStartupState);
  const isOnboardingCompleted = useAppSelector(selectisOnboardingComplete);
  const {themeType} = useIOThemeContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(startupSetLoading());
  }, [dispatch]);

  const getInitialScreen = useCallback((): Screens => {
    switch (isStartupDone) {
      case 'DONE':
        // Startup is done, check if onboarding is completed
        return isOnboardingCompleted
          ? {name: ROUTES.MAIN_HOME, component: TabNavigation}
          : {name: ONBOARDING_ROUTES.MAIN, component: OnboardingNavigator};
      case 'ERROR':
        // An error occurred during startup
        return {name: ROUTES.MAIN_ERROR, component: () => <></>}; // TODO: Add error screen
      case 'LOADING':
      case 'NOT_STARTED':
      default:
        return {name: ROUTES.MAIN_LOADING, component: () => <></>}; // TODO: Add loading screen
    }
  }, [isStartupDone, isOnboardingCompleted]);

  const initialScreen = getInitialScreen();

  return (
    <NavigationContainer
      theme={
        themeType === 'light' ? IONavigationLightTheme : IONavigationDarkTheme
      }>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name={initialScreen.name}
          component={initialScreen.component}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
