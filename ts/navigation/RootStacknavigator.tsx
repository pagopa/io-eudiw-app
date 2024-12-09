import {
  NavigationContainer,
  NavigatorScreenParams
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {useIOThemeContext} from '@pagopa/io-app-design-system';
import OnboardingNavigator, {
  OnboardingNavigatorParamsList
} from '../features/onboarding/navigation/OnboardingNavigator';
import {useAppDispatch, useAppSelector} from '../store';
import {selectStartupState, startupSetLoading} from '../store/reducers/startup';
import {selectisOnboardingComplete} from '../store/reducers/preferences';
import {WalletNavigatorParamsList} from '../features/wallet/navigation/WalletNavigator';
import {IONavigationDarkTheme, IONavigationLightTheme} from './theme';
import ROOT_ROUTES from './routes';
import MainStackNavigator, {
  MainNavigatorParamsList
} from './main/MainStackNavigator';
import MAIN_ROUTES from './main/routes';

export type RootStackParamList = {
  // Main
  [ROOT_ROUTES.TAB_NAV]: NavigatorScreenParams<MainNavigatorParamsList>;
  [ROOT_ROUTES.ERROR]: undefined;
  [ROOT_ROUTES.LOADING]: undefined;
  [ROOT_ROUTES.ERROR]: undefined;

  // Onboarding
  [ROOT_ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingNavigatorParamsList>;

  // Main navigator when onboarding is completed
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET]: NavigatorScreenParams<WalletNavigatorParamsList>;
};

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
          ? {name: ROOT_ROUTES.TAB_NAV, component: MainStackNavigator}
          : {name: ROOT_ROUTES.ONBOARDING, component: OnboardingNavigator};
      case 'ERROR':
        // An error occurred during startup
        return {name: ROOT_ROUTES.ERROR, component: () => <></>}; // TODO: Add error screen
      case 'LOADING':
      case 'NOT_STARTED':
      default:
        return {name: ROOT_ROUTES.LOADING, component: () => <></>}; // TODO: Add loading screen
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
