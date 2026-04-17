import { useIOThemeContext } from '@pagopa/io-app-design-system';
import {
  LinkingOptions,
  NavigationContainer,
  NavigatorScreenParams
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect } from 'react';
import { useStoredFontPreference } from '../context/DSTypeFaceContext';
import OnboardingNavigator, {
  OnboardingNavigatorParamsList
} from './OnboardingNavigator';
import { useAppDispatch, useAppSelector } from '../store';
import ROOT_ROUTES from './routes';
import { IONavigationDarkTheme, IONavigationLightTheme } from './theme';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { navigationRef } from '@io-eudiw-app/navigation';
import {
  selectStartupStatus,
  startupSetLoading
} from '../store/reducers/startup';
import {
  LoadingScreenContent,
  OperationResultScreenContent
} from '@io-eudiw-app/commons';
import { Linking } from 'react-native';
import { setUrl } from '../store/reducers/deeplinking';
import { t } from 'i18next';

export type RootStackParamList = {
  // Main
  [ROOT_ROUTES.ERROR]: undefined;
  [ROOT_ROUTES.LOADING]: undefined;
  [ROOT_ROUTES.ERROR]: undefined;

  // Onboarding
  [ROOT_ROUTES.ONBOARDING_NAV]: NavigatorScreenParams<OnboardingNavigatorParamsList>;

  // Features
  [ROOT_ROUTES.IT_WALLET_NAV]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Type definition for the screens to be rendered based on the startup and onboarding states.
 */
type Screens = {
  name: keyof RootStackParamList;
  component: React.ComponentType<unknown>;
};

const Loading = ({ title }: { title: string }) => (
  <LoadingScreenContent contentTitle={title} />
);

const LoadingScreen = () => (
  <Loading title={t('generics.waiting', { ns: 'common' })} />
);

/**
 * Entry point stack navigator for the application. This is the main navigation which orchestrates the whole app navigation.
 * It's based on the startup state and the onboarding completion state and renders the appropriate screen based on these states.
 */
export const RootStackNavigator = () => {
  useStoredFontPreference();
  const startupStatus = useAppSelector(selectStartupStatus);
  const { themeType } = useIOThemeContext();
  const dispatch = useAppDispatch();

  const GenericError = () => {
    // Title and body are hardcoded to minimize the risk of errors while displaying the error screen
    const title = "There's an issue with our systems";
    const body = 'Please try again in a few minutes.';
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={title}
        subtitle={body}
      />
    );
  };

  useEffect(() => {
    dispatch(startupSetLoading());
  }, [dispatch]);

  const getInitialScreen = useCallback((): Screens => {
    switch (startupStatus) {
      case 'DONE':
        return {
          name: ROOT_ROUTES.IT_WALLET_NAV,
          component: itWalletFeature.Navigator
        };

      case 'WAIT_ONBOARDING':
        return {
          name: ROOT_ROUTES.ONBOARDING_NAV,
          component: OnboardingNavigator
        };

      case 'ERROR':
        // An error occurred during startup
        return { name: ROOT_ROUTES.ERROR, component: GenericError };

      case 'LOADING':
      case 'NOT_STARTED':
      case 'WAIT_IDENTIFICATION':
      default:
        return { name: ROOT_ROUTES.LOADING, component: LoadingScreen };
    }
  }, [startupStatus]);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [...itWalletFeature.linkingSchemes],
    config: {
      screens: {
        ROOT_IT_WALLET_NAV: {
          screens: { ...itWalletFeature.linkingConfig }
        }
      }
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (url) {
        dispatch(setUrl({ url }));
      }
      return url;
    },
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => {
        listener(url);
        if (
          ['WAIT_IDENTIFICATION', 'LOADING', 'NOT_STARTED'].includes(
            startupStatus
          )
        ) {
          dispatch(setUrl({ url }));
        }
      };

      const subscription = Linking.addEventListener('url', onReceiveURL);
      return () => subscription.remove();
    }
  };

  const initialScreen = getInitialScreen();

  return (
    <NavigationContainer
      theme={
        themeType === 'light' ? IONavigationLightTheme : IONavigationDarkTheme
      }
      linking={linking}
      ref={navigationRef}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={initialScreen.name}
          component={initialScreen.component}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
