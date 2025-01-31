import {
  LinkingOptions,
  NavigationContainer,
  NavigatorScreenParams
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {useIOThemeContext} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {Linking} from 'react-native';
import OnboardingNavigator, {
  OnboardingNavigatorParamsList
} from '../features/onboarding/navigation/OnboardingNavigator';
import {useAppDispatch, useAppSelector} from '../store';
import {selectStartupState, startupSetLoading} from '../store/reducers/startup';
import {OperationResultScreenContent} from '../components/screens/OperationResultScreenContent';
import LoadingScreenContent from '../components/LoadingScreenContent';
import {WalletNavigatorParamsList} from '../features/wallet/navigation/WalletNavigator';
import {setUrl} from '../store/reducers/deeplinking';
import {PRESENTATION_INTERNAL_LINK} from '../features/qrcode/scan/utils/recognizedLinks';
import {IONavigationDarkTheme, IONavigationLightTheme} from './theme';
import ROOT_ROUTES from './routes';
import MainStackNavigator, {
  MainNavigatorParamsList
} from './main/MainStackNavigator';
import {navigationRef} from './utils';
import MAIN_ROUTES from './main/routes';

export type RootStackParamList = {
  // Main
  [ROOT_ROUTES.MAIN_NAV]: NavigatorScreenParams<MainNavigatorParamsList>;
  [ROOT_ROUTES.ERROR]: undefined;
  [ROOT_ROUTES.LOADING]: undefined;
  [ROOT_ROUTES.ERROR]: undefined;

  // Onboarding
  [ROOT_ROUTES.ONBOARDING_NAV]: NavigatorScreenParams<OnboardingNavigatorParamsList>;

  // Main navigator when onboarding is completed
  [MAIN_ROUTES.TAB_NAV]: undefined;
  [MAIN_ROUTES.WALLET_NAV]: NavigatorScreenParams<WalletNavigatorParamsList>;
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
  const {themeType} = useIOThemeContext();
  const dispatch = useAppDispatch();

  const Loading = () => (
    <LoadingScreenContent contentTitle={i18next.t('generics.waiting')} />
  );

  const GenericError = () => {
    // Title and body are hardcoded to minimize the risk of errors while displaying the error screen
    const title = "There's an issue with our systems";
    const body = 'Please try again in a few minutes.';
    return (
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={title}
        subtitle={body}
      />
    );
  };

  useEffect(() => {
    dispatch(startupSetLoading());
  }, [dispatch]);

  const getInitialScreen = useCallback((): Screens => {
    switch (isStartupDone) {
      case 'DONE':
        return {name: ROOT_ROUTES.MAIN_NAV, component: MainStackNavigator};

      case 'WAIT_ONBOARDING':
        return {
          name: ROOT_ROUTES.ONBOARDING_NAV,
          component: OnboardingNavigator
        };

      case 'ERROR':
        // An error occurred during startup
        return {name: ROOT_ROUTES.ERROR, component: GenericError};

      case 'LOADING':
      case 'NOT_STARTED':
      case 'WAIT_IDENTIFICATION':
      default:
        return {name: ROOT_ROUTES.LOADING, component: Loading};
    }
  }, [isStartupDone]);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [PRESENTATION_INTERNAL_LINK],
    config: {
      screens: {
        ROOT_MAIN_NAV: {
          screens: {
            MAIN_WALLET_NAV: {
              screens: {
                PRESENTATION_PRE_DEFINITION: {
                  // why can't typescript infer the type of deeply nested navigators?
                  path: '*', // match any path after PRESENTATION_PRE_DEFINITION
                  alias: [''] // match empty path after PRESENTATION_PRE_DEFINITION
                }
              }
            }
          }
        }
      }
    },
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();
      if (url) {
        dispatch(setUrl({url}));
      }
      return url;
    },
    subscribe(listener) {
      const onReceiveURL = ({url}: {url: string}) => {
        listener(url);
        if (
          isStartupDone === 'WAIT_IDENTIFICATION' ||
          isStartupDone === 'LOADING' ||
          isStartupDone === 'NOT_STARTED'
        ) {
          dispatch(setUrl({url}));
        }
      };

      Linking.addEventListener('url', onReceiveURL);

      return () => {
        Linking.removeAllListeners('url');
      };
    }
  };

  const initialScreen = getInitialScreen();

  return (
    <NavigationContainer
      theme={
        themeType === 'light' ? IONavigationLightTheme : IONavigationDarkTheme
      }
      linking={linking}
      ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name={initialScreen.name}
          component={initialScreen.component}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
