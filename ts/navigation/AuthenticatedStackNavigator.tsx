import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
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
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
