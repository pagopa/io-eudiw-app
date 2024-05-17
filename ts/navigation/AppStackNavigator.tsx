/* eslint-disable functional/immutable-data */
import React, { useEffect, ReactElement, useRef } from "react";
import { View } from "react-native";
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerProps
} from "@react-navigation/native";
import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { isStartupLoaded } from "../store/reducers/startup";
import { startApplicationInitialization } from "../store/actions/application";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { isTestEnv } from "../utils/environment";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../utils/navigation";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../theme/navigations";
//import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import AuthenticatedStackNavigator from "./AuthenticatedStackNavigator";
import { AppParamsList } from "./params/AppParamsList";
import NavigationService, {
  navigationRef,
  setMainNavigatorReady
} from "./NavigationService";
import ROUTES from "./routes";

type OnStateChangeStateType = Parameters<
  NonNullable<NavigationContainerProps["onStateChange"]>
>[0];
const isMainNavigatorReady = (state: OnStateChangeStateType) =>
  state &&
  state.routes &&
  state.routes.length > 0 &&
  state.routes[0].name === ROUTES.MAIN;

export const AppStackNavigator = (): ReactElement => {
  const dispatch = useIODispatch();

  const startupStatus = useIOSelector(isStartupLoaded);

  useEffect(() => {
    dispatch(startApplicationInitialization());
  }, [dispatch]);

  return <AuthenticatedStackNavigator />;
};

const InnerNavigationContainer = (props: { children: React.ReactElement }) => {
  const routeNameRef = useRef<string>();
  const dispatch = useIODispatch();

  // Dark/Light Mode
  const { themeType } = useIOThemeContext();

  const linking: LinkingOptions<AppParamsList> = {
    enabled: !isTestEnv, // disable linking in test env
    prefixes: [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX]
    // config: {}
  };

  return (
    <NavigationContainer
      theme={
        themeType === "light" ? IONavigationLightTheme : IONavigationDarkTheme
      }
      ref={navigationRef}
      linking={linking}
      //fallback={<LoadingSpinnerOverlay isLoading={true} />}
      onReady={() => {
        NavigationService.setNavigationReady();
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async state => {
        if (isMainNavigatorReady(state)) {
          setMainNavigatorReady();
        }
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
        if (currentRouteName !== undefined) {
          dispatch(setDebugCurrentRouteName(currentRouteName));
          // trackScreen(previousRouteName, currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      {props.children}
    </NavigationContainer>
  );
};

/**
 * Wraps the NavigationContainer with the AppStackNavigator (Root navigator of the app)
 * @constructor
 */
export const IONavigationContainer = () => (
  <InnerNavigationContainer>
    <AppStackNavigator />
  </InnerNavigationContainer>
);

export const TestInnerNavigationContainer = isTestEnv
  ? InnerNavigationContainer
  : View;
