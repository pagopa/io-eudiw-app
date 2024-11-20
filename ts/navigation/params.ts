import {NavigatorScreenParams} from '@react-navigation/native';
import {OnboardingNavigatorParamsList} from '../features/onboarding/navigation/OnboardingNavigator';
import ONBOARDING_ROUTES from '../features/onboarding/navigation/routes';
import ROUTES from './routes';

export type RootStackParamList = {
  // Main
  [ROUTES.MAIN_HOME]: undefined;
  [ROUTES.MAIN_WALLET]: undefined;
  [ROUTES.MAIN_SCAN_QR]: undefined;
  [ROUTES.MAIN_SHOW_QR]: undefined;
  [ROUTES.MAIN_ERROR]: undefined;
  [ROUTES.MAIN_LOADING]: undefined;

  // Onboarding
  [ONBOARDING_ROUTES.MAIN]: NavigatorScreenParams<OnboardingNavigatorParamsList>;
};
