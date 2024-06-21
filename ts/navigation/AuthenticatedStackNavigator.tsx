
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/ItwRoutes";
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
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
