import React, { useEffect, useState } from "react";
import { H1, Body } from "@pagopa/io-app-design-system";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { PID } from "@pagopa/io-react-native-wallet";
import cieManager from "@pagopa/io-react-native-cie-pid";
import { ProximityManager } from "@pagopa/io-react-native-proximity";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const InitialScreen = () => {
  const [hasNFCFeature, setHasNFCFeature] = useState(false);

  useEffect(() => {
    cieManager.hasNFCFeature().then(setHasNFCFeature);
  }, []);

  return (
    <SafeAreaView>
      <H1>Initial screen</H1>
      <Body>React Native Application for EUDIW PoC</Body>
      <Body>IO React Native Wallet: {PID.SdJwt ? "✅" : "❗️"}</Body>
      <Body>IO React Native CIE PID: {cieManager ? "✅" : "❗️"}</Body>
      <Body>IO React Native Proximity: {ProximityManager ? "✅" : "❗️"}</Body>
      <Body>NFC Available: {hasNFCFeature ? "✅" : "❗️"}</Body>
    </SafeAreaView>
  );
};

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
