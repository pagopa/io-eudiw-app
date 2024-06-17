import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwPrCredentialDetailsScreen from "../screens/presentation/ItwPrCredentialDetails";
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
    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS}
      component={ItwPrCredentialDetailsScreen}
    />
  </Stack.Navigator>
);
