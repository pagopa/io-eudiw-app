import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingCarousel } from '../screens/OnboardingCarousel';
import OnboardingStart from '../screens/OnboardingStart';
import {
  PinCreation,
  PinCreationProps
} from '../../../screens/pin/PinCreation';
import OnboardingBiometricAvailable from '../screens/OnboardingBiometricAvailable';
import OnboardingBiometricNotEnrolled from '../screens/OnboardingBiometricNotEnrolled';
import OnboardingBiometricNoScreenLock from '../screens/OnboardingBiometricNoScreenLock';
import ONBOARDING_ROUTES from './routes';

/**
 * Screen parameters for the onboarding navigator.
 * New screens should be added here along with their parameters.
 */
export type OnboardingNavigatorParamsList = {
  [ONBOARDING_ROUTES.MAIN]: undefined;
  [ONBOARDING_ROUTES.CAROUSEL]: undefined;
  [ONBOARDING_ROUTES.START]: undefined;
  [ONBOARDING_ROUTES.PIN.CREATION]: PinCreationProps;
  [ONBOARDING_ROUTES.BIOMETRIC.AVAILABLE]: undefined;
  [ONBOARDING_ROUTES.BIOMETRIC.NOT_ENROLLED]: undefined;
  [ONBOARDING_ROUTES.BIOMETRIC.NO_SCREEN_LOCK]: undefined;
};

const Stack = createNativeStackNavigator<OnboardingNavigatorParamsList>();

/**
 * The onboarding related stack which is used to navigate between onboarding screens on the first app launch.
 * It includes the initial carousel screen, the start screen, the PIN creation screen and the biometric screens.
 * The three biometric screens are shown based on the device's biometric capabilities and the user's settings.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ONBOARDING_ROUTES.CAROUSEL}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      name={ONBOARDING_ROUTES.CAROUSEL}
      component={OnboardingCarousel}
    />
    <Stack.Screen name={ONBOARDING_ROUTES.START} component={OnboardingStart} />
    <Stack.Screen
      name={ONBOARDING_ROUTES.PIN.CREATION}
      component={PinCreation}
    />
    <Stack.Screen
      name={ONBOARDING_ROUTES.BIOMETRIC.AVAILABLE}
      component={OnboardingBiometricAvailable}
    />
    <Stack.Screen
      name={ONBOARDING_ROUTES.BIOMETRIC.NOT_ENROLLED}
      component={OnboardingBiometricNotEnrolled}
    />
    <Stack.Screen
      name={ONBOARDING_ROUTES.BIOMETRIC.NO_SCREEN_LOCK}
      component={OnboardingBiometricNoScreenLock}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
