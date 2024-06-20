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
import ItwIssuingPidStoreScreen from "../screens/issuance/pid/ItwIssuancePidStoreScreen";
import ItwPrPidDetails from "../screens/presentation/ItwPrPidDetails";
import ItwIssuanceCredentialChecksScreen from "../screens/issuance/credential/ItwIssuanceCredentialChecksScreen";
import ItwIssuanceCredentialAuthScreen from "../screens/issuance/credential/ItwIssuanceCredentialAuthScreen";
import ItwIssuanceCredentialPreviewScreen from "../screens/issuance/credential/ItwIssuanceCredentialPreviewScreen";
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
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.STORE}
      component={ItwIssuingPidStoreScreen}
    />

    {/* PRESENTATION PID */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.DETAILS}
      component={ItwPrPidDetails}
    />

    {/* ISSUANCE CREDENTIAL */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG}
      component={ItwIssuanceCredentialCatalogScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.CHECKS}
      component={ItwIssuanceCredentialChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.AUTH}
      component={ItwIssuanceCredentialAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.PREVIEW}
      component={ItwIssuanceCredentialPreviewScreen}
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
