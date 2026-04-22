import { useIOThemeContext } from '@pagopa/io-app-design-system';
import {
  LinkingOptions,
  NavigationContainer,
  NavigatorScreenParams
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useMemo } from 'react';
import { useStoredFontPreference } from '../context/DSTypeFaceContext';
import OnboardingNavigator, {
  OnboardingNavigatorParamsList
} from './OnboardingNavigator';
import MiniAppSelection from '../screens/MiniAppSelection';
import { useAppDispatch, useAppSelector } from '../store';
import ROOT_ROUTES from './routes';
import { IONavigationDarkTheme, IONavigationLightTheme } from './theme';
import { navigationRef } from '@io-eudiw-app/navigation';
import {
  selectStartupStatus,
  startupSetLoading
} from '../store/reducers/startup';
import {
  LoadingScreenContent,
  OperationResultScreenContent
} from '@io-eudiw-app/commons';
import { selectSelectedMiniAppId } from '@io-eudiw-app/preferences';
import { getMiniAppById } from '../utils/miniapp';
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

  // Mini-app selection
  [ROOT_ROUTES.MINI_APP_SELECTION]: undefined;

  // Selected mini-app
  [ROOT_ROUTES.MINI_APP_NAV]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Type definition for the screens to be rendered based on the startup and onboarding states.
 */
type Screens = {
  name: keyof RootStackParamList;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
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
          name: ROOT_ROUTES.MINI_APP_NAV,
          component: selectedMiniApp?.Navigator ?? LoadingScreen
        };

      case 'WAIT_ONBOARDING':
        return {
          name: ROOT_ROUTES.ONBOARDING_NAV,
          component: OnboardingNavigator
        };

      case 'WAIT_MINI_APP_SELECTION':
        return {
          name: ROOT_ROUTES.MINI_APP_SELECTION,
          component: MiniAppSelection
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
  }, [startupStatus, selectedMiniApp]);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: selectedMiniApp ? [...selectedMiniApp.linkingSchemes] : [],
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
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => {
        listener(url);
        if (
          [
            'WAIT_IDENTIFICATION',
            'WAIT_MINI_APP_SELECTION',
            'LOADING',
            'NOT_STARTED'
          ].includes(startupStatus)
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
