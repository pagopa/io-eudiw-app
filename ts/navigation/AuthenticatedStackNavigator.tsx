import React from "react";
import { H1, Body } from "@pagopa/io-app-design-system";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const InitialScreen = () => (
  <SafeAreaView>
    <H1>Initial screen</H1>
    <Body>React Native Application for EUDIW PoC</Body>
  </SafeAreaView>
);

const AuthenticatedStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN}
      screenOptions={{
        gestureEnabled: false,
        headerMode: "screen"
      }}
    >
      <Stack.Screen
        name={ROUTES.MAIN}
        options={{ headerShown: false }}
        component={InitialScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
