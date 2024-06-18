import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwPrCredentialDetailsScreen from "../screens/presentation/ItwPrCredentialDetails";
import ItwPrRemoteCredentialInitScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialChecksScreen";
import ItwIssuanceCredentialCatalogScreen from "../screens/issuance/credential/ItwIssuanceCredentialCatalogScreen";
import ItwIssuancePidInfoScreen from "../screens/issuance/pid/ItwIssuancePidInfoScreen";
import ItwIssuancePidAuthScreen from "../screens/issuance/pid/ItwIssuancePidAuthScreen";
import ItwIssuingPidAuthInfoScreen from "../screens/issuance/pid/ItwIssuancePidAuthInfoScreen";
import ItwIssuancePidRequestScreen from "../screens/issuance/pid/ItwIssuancePidRequestScreen";
import ItwIssuancePidPreviewScreen from "../screens/issuance/pid/ItwIssuancePidPreviewScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./ItwRoutes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      gestureEnabled: isGestureEnabled,
      headerShown: false
    }}
  >
    {/* ISSUANCE PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.INFO}
      component={ItwIssuancePidInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.AUTH}
      component={ItwIssuancePidAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.AUTH_INFO}
      component={ItwIssuingPidAuthInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.REQUEST}
      component={ItwIssuancePidRequestScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.PREVIEW}
      component={ItwIssuancePidPreviewScreen}
    />
    {/* ISSUANCE CREDENTIAL */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG}
      component={ItwIssuanceCredentialCatalogScreen}
    />
    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS}
      component={ItwPrCredentialDetailsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.INIT}
      component={ItwPrRemoteCredentialInitScreen}
    />
  </Stack.Navigator>
);
