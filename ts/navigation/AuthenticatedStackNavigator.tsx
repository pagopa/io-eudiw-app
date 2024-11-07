import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/ItwRoutes";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import I18n from "../i18n";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";
import { MainTabNavigator } from "./TabNavigator";
import OnboardingNavigator from "./OnboardingNavigator";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const AuthenticatedStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN}
      screenOptions={{
        gestureEnabled: true,
        headerMode: "screen"
      }}
    >
      <Stack.Screen
        name={ROUTES.MAIN}
        options={hideHeaderOptions}
        component={MainTabNavigator}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING}
        options={hideHeaderOptions}
        component={OnboardingNavigator}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={ITW_ROUTES.MAIN}
        component={ItwStackNavigator}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_MAIN}
        component={ProfileMainScreen}
        options={{ title: I18n.t("profile.main.title"), headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
