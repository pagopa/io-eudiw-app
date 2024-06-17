import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/ItwRoutes";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";
import { MainTabNavigator } from "./TabNavigator";

const Stack = createStackNavigator<AppParamsList>();

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
        options={{ headerShown: false }}
        component={MainTabNavigator}
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
