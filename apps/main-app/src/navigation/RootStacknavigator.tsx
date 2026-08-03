import {
  LoadingScreenContent,
  OperationResultScreenContent
} from '@io-eudiw-app/commons';
import { navigationRef, setUrl } from '@io-eudiw-app/navigation';
import { selectSelectedMiniAppId } from '@io-eudiw-app/preferences';
import { useIOThemeContext } from '@pagopa/io-app-design-system';
import {
  LinkingOptions,
  NavigationContainer,
  NavigatorScreenParams
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { Linking } from 'react-native';

import { useStoredFontPreference } from '../context/DSTypeFaceContext';
import MiniAppSelection from '../screens/MiniAppSelection';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectStartupStatus,
  startupSetLoading
} from '../store/reducers/startup';
import { getMiniAppById } from '../utils/miniapp';
import OnboardingNavigator, {
  OnboardingNavigatorParamsList
} from './OnboardingNavigator';
import ROOT_ROUTES from './routes';
import { IONavigationDarkTheme, IONavigationLightTheme } from './theme';

export type RootStackParamList = {
  // Main
  [ROOT_ROUTES.ERROR]: undefined;
  [ROOT_ROUTES.ERROR]: undefined;
  [ROOT_ROUTES.LOADING]: undefined;

  // Selected mini-app
  [ROOT_ROUTES.MINI_APP_NAV]: undefined;

  // Mini-app selection
  [ROOT_ROUTES.MINI_APP_SELECTION]: undefined;

  // Onboarding
  [ROOT_ROUTES.ONBOARDING_NAV]: NavigatorScreenParams<OnboardingNavigatorParamsList>;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Type definition for the screens to be rendered based on the startup and onboarding states.
 */
type Screens = {
  component: React.ComponentType<unknown>;

  name: keyof RootStackParamList;
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
  const selectedMiniAppId = useAppSelector(selectSelectedMiniAppId);
  const { themeType } = useIOThemeContext();
  const dispatch = useAppDispatch();

  const selectedMiniApp = useMemo(
    () => getMiniAppById(selectedMiniAppId),
    [selectedMiniAppId]
  );

  const GenericError = () => {
    // Title and body are hardcoded to minimize the risk of errors while displaying the error screen
    const title = "There's an issue with our systems";
    const body = 'Please try again in a few minutes.';
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        subtitle={body}
        title={title}
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
          component: selectedMiniApp?.Navigator ?? LoadingScreen,
          name: ROOT_ROUTES.MINI_APP_NAV
        };

      case 'ERROR':
        // An error occurred during startup
        return { component: GenericError, name: ROOT_ROUTES.ERROR };

      case 'WAIT_MINI_APP_SELECTION':
        return {
          component: MiniAppSelection,
          name: ROOT_ROUTES.MINI_APP_SELECTION
        };

      case 'WAIT_ONBOARDING':
        return {
          component: OnboardingNavigator,
          name: ROOT_ROUTES.ONBOARDING_NAV
        };

      case 'LOADING':
      case 'NOT_STARTED':
      case 'WAIT_IDENTIFICATION':
      default:
        return { component: LoadingScreen, name: ROOT_ROUTES.LOADING };
    }
  }, [startupStatus, selectedMiniApp]);

  const linking: LinkingOptions<RootStackParamList> = {
    config: {
      screens: {
        ...(selectedMiniApp && {
          [ROOT_ROUTES.MINI_APP_NAV]: {
            screens: { ...selectedMiniApp.linkingConfig }
          }
        })
      }
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (url) {
        dispatch(setUrl({ url }));
      }
      return url;
    },
    prefixes: selectedMiniApp ? [...selectedMiniApp.linkingSchemes] : [],
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => {
        // Always persist the full URL (including its scheme) before letting
        // React Navigation handle it. The centralized deep link handler reads
        // this value via `selectUrl` to decide the routing, so it must be set
        // regardless of the startup state (i.e. also when navigation is ready).
        dispatch(setUrl({ url }));
        listener(url);
      };

      const subscription = Linking.addEventListener('url', onReceiveURL);
      return () => subscription.remove();
    }
  };

  const initialScreen = getInitialScreen();

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      theme={
        themeType === 'light' ? IONavigationLightTheme : IONavigationDarkTheme
      }
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          component={initialScreen.component}
          name={initialScreen.name}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
