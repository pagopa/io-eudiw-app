import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwHomeScreen from "../screens/ItwHomeScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./ItwRoutes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ITW_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen name={ITW_ROUTES.MAIN} component={ItwHomeScreen} />
  </Stack.Navigator>
);
