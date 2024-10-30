import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { IOColors, makeFontStyleObject } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { TabIconComponent } from "../components/ui/TabIconComponent";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import ItwHomeScreen from "../features/itwallet/screens/ItwHomeScreen";
import { BarcodeScanScreen } from "../features/barcode/screens/BarcodeScanScreen";
import { useBottomTabNavigatorStyle } from "../hooks/useBottomTabNavigatorStyle";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const Tab = createBottomTabNavigator<MainTabParamsList>();

export const MainTabNavigator = () => {
  const startupLoaded = useIOSelector(isStartupLoaded);
  const tabBarStyle = useBottomTabNavigatorStyle();

  return (
    <LoadingSpinnerOverlay
      isLoading={startupLoaded === StartupStatusEnum.ONBOARDING}
      loadingOpacity={1}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            ...makeFontStyleObject(12, "ReadexPro", undefined)
          },
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: false,
          tabBarActiveTintColor: IOColors["blueIO-500"],
          tabBarInactiveTintColor: IOColors["grey-850"],
          tabBarStyle
        }}
      >
        <Tab.Screen
          name={ROUTES.ITWALLET_HOME}
          component={ItwHomeScreen}
          options={{
            title: I18n.t("global.navigator.itwallet"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName={"navWallet"}
                iconNameFocused={"navWalletFocused"}
                color={color}
                focused={focused}
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.QR_CODE_SCAN}
          component={BarcodeScanScreen}
          options={{
            title: I18n.t("global.navigator.scan"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName={"navScan"}
                iconNameFocused={"navScan"}
                color={color}
                focused={focused}
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.PROFILE_MAIN}
          component={ProfileMainScreen}
          options={{
            title: I18n.t("global.navigator.profile"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName="navProfile"
                iconNameFocused="navProfileFocused"
                color={color}
                focused={focused}
              />
            )
          }}
        />
      </Tab.Navigator>
    </LoadingSpinnerOverlay>
  );
};
