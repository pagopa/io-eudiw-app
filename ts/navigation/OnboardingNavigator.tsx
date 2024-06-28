import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import OnboardingPinScreen from "../screens/onboarding/OnboardingPinScreen";
import { isGestureEnabled } from "../utils/navigation";
import FingerprintScreen from "../screens/onboarding/biometric&securityChecks/FingerprintScreen";
import MissingDevicePinScreen from "../screens/onboarding/biometric&securityChecks/MissingDevicePinScreen";
import MissingDeviceBiometricScreen from "../screens/onboarding/biometric&securityChecks/MissingDeviceBiometricScreen";
import { OnboardingParamsList } from "./params/OnboardingParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<OnboardingParamsList>();
/**
 * The onboarding related stack of screens of the application.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING_PIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={ROUTES.ONBOARDING_PIN}
      component={OnboardingPinScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_FINGERPRINT}
      component={FingerprintScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_PIN}
      component={MissingDevicePinScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC}
      component={MissingDeviceBiometricScreen}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
