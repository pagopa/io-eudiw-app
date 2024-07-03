import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ContentWrapper,
  HeaderFirstLevel,
  IOColors,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { TabIconComponent } from "../components/ui/TabIconComponent";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import variables from "../theme/variables";
import ItwHomeScreen from "../features/itwallet/screens/ItwHomeScreen";
import { BarcodeScanScreen } from "../features/bardcode/screens/BarcodeScanScreen";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: IOColors.white,
    paddingLeft: 3,
    paddingRight: 3,
    borderTopWidth: 0,
    paddingTop: 8,
    // iOS shadow
    shadowColor: variables.footerShadowColor,
    shadowOffset: {
      width: variables.footerShadowOffsetWidth,
      height: variables.footerShadowOffsetHeight
    },
    zIndex: 999,
    shadowOpacity: variables.footerShadowOpacity,
    shadowRadius: variables.footerShadowRadius,
    // Android shadow
    elevation: variables.footerElevation
  }
});

const Tab = createBottomTabNavigator<MainTabParamsList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const startupLoaded = useIOSelector(isStartupLoaded);

  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;

  return (
    <LoadingSpinnerOverlay
      isLoading={startupLoaded === StartupStatusEnum.ONBOARDING}
      loadingOpacity={1}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 10,
            ...makeFontStyleObject("Regular", false, "ReadexPro")
          },
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: false,
          tabBarActiveTintColor: IOColors["blueIO-500"],
          tabBarInactiveTintColor: IOColors["grey-850"],
          tabBarStyle: [
            styles.tabBarStyle,
            { height: tabBarHeight + bottomInset },
            insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
          ]
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
          component={MockProfile}
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

const MockProfile = () => (
  <>
    <HeaderFirstLevel title="Mock Profile" type="base" />
    <ContentWrapper>
      <Text>Profile</Text>
    </ContentWrapper>
  </>
);
