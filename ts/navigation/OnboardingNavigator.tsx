import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import OnboardingPinScreen from "../screens/onboarding/OnboardingPinScreen";
import { isGestureEnabled } from "../utils/navigation";
import OnboardingWalletScreen from "../screens/onboarding/OnboardingWalletScreen";
import OnboardingWalletCompleteScreen from "../screens/onboarding/OnboardingWalletCompleteScreen";
import { OnboardingParamsList } from "./params/OnboardingParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<OnboardingParamsList>();
/**
 * The onboarding related stack of screens of the application.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING_WALLET}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={ROUTES.ONBOARDING_WALLET}
      component={OnboardingWalletScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_WALLET_COMPLETE}
      component={OnboardingWalletCompleteScreen}
      options={{
        headerShown: false,
        gestureEnabled: false
      }}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_PIN}
      component={OnboardingPinScreen}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
