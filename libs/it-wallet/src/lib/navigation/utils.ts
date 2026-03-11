import { createNavigationContainerRef } from '@react-navigation/native';
import { MainNavigatorParamsList } from './main/MainStackNavigator';

/**
 * Navigation reference which can be used to navigate outside of React context.
 */
export const navigationRef = createNavigationContainerRef<MainNavigatorParamsList>();

type NavigationUtilParams<RouteName extends keyof MainNavigatorParamsList> =
  RouteName extends unknown
    ? undefined extends MainNavigatorParamsList[RouteName]
      ?
          | [screen: RouteName]
          | [screen: RouteName, params: MainNavigatorParamsList[RouteName]]
      : [screen: RouteName, params: MainNavigatorParamsList[RouteName]]
    : never;

/**
 * Navigate to a screen outside of React context.
 * @param args - The screen name and optional params.
 */
export function navigate<RouteName extends keyof MainNavigatorParamsList>(
  ...args: NavigationUtilParams<RouteName>
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args);
  }
}

/**
 * Navigate to a screen resetting navigation state outside of React context.
 * @param args - The screen name and optional params.
 */
export function navigateWithReset<RouteName extends keyof MainNavigatorParamsList>(
  ...args: NavigationUtilParams<RouteName>
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: args[0], params: args[1] }]
    });
  }
}

/**
 * Method to retrieve the navigation status.
 * @returns true if the navigation is ready, false otherwise.
 */
export const isNavigationReady = () => navigationRef.isReady();
