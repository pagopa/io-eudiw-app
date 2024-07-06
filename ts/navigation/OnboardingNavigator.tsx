import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import OnboardingPinScreen from "../screens/onboarding/OnboardingPinScreen";
import CarouselWalletScreen from "../screens/carousel/CarouselWallet";
import CarouselWalletCompleteScreen from "../screens/carousel/CarouselWalletComplete";
import { OnboardingParamsList } from "./params/OnboardingParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<OnboardingParamsList>();
/**
 * The onboarding related stack of screens of the application.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING_WALLET}
    screenOptions={{ gestureEnabled: false, headerMode: "screen" }}
  >
    <Stack.Screen
      name={ROUTES.ONBOARDING_WALLET}
      component={CarouselWalletScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_WALLET_COMPLETE}
      component={CarouselWalletCompleteScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_PIN}
      component={OnboardingPinScreen}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
