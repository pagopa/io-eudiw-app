import { createStackNavigator } from '@react-navigation/stack';

import OnboardingBiometricAvailable from '../screens/onboarding/OnboardingBiometricAvailable';
import OnboardingBiometricNoScreenLock from '../screens/onboarding/OnboardingBiometricNoScreenLock';
import OnboardingBiometricNotEnrolled from '../screens/onboarding/OnboardingBiometricNotEnrolled';
import { OnboardingCarousel } from '../screens/onboarding/OnboardingCarousel';
import ONBOARDING_ROUTES from '../screens/onboarding/routes';
import { PinCreation, PinCreationProps } from '../screens/pin/PinCreation';

/**
 * Screen parameters for the onboarding navigator.
 * New screens should be added here along with their parameters.
 */
export type OnboardingNavigatorParamsList = {
  [ONBOARDING_ROUTES.BIOMETRIC.AVAILABLE]: undefined;
  [ONBOARDING_ROUTES.BIOMETRIC.NO_SCREEN_LOCK]: undefined;
  [ONBOARDING_ROUTES.BIOMETRIC.NOT_ENROLLED]: undefined;
  [ONBOARDING_ROUTES.CAROUSEL]: undefined;
  [ONBOARDING_ROUTES.MAIN]: undefined;
  [ONBOARDING_ROUTES.PIN.CREATION]: PinCreationProps;
  [ONBOARDING_ROUTES.START]: undefined;
};

const Stack = createStackNavigator<OnboardingNavigatorParamsList>();

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
      component={OnboardingCarousel}
      name={ONBOARDING_ROUTES.CAROUSEL}
    />
    <Stack.Screen
      component={PinCreation}
      name={ONBOARDING_ROUTES.PIN.CREATION}
    />
    <Stack.Screen
      component={OnboardingBiometricAvailable}
      name={ONBOARDING_ROUTES.BIOMETRIC.AVAILABLE}
    />
    <Stack.Screen
      component={OnboardingBiometricNotEnrolled}
      name={ONBOARDING_ROUTES.BIOMETRIC.NOT_ENROLLED}
    />
    <Stack.Screen
      component={OnboardingBiometricNoScreenLock}
      name={ONBOARDING_ROUTES.BIOMETRIC.NO_SCREEN_LOCK}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
