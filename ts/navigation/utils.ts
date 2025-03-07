import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from './RootStacknavigator';

/**
 * Navigation reference which can be used to navigate outside of React context.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type NavigationUtilParams<RouteName extends keyof RootStackParamList> =
  RouteName extends unknown
    ? undefined extends RootStackParamList[RouteName]
      ?
          | [screen: RouteName]
          | [screen: RouteName, params: RootStackParamList[RouteName]]
      : [screen: RouteName, params: RootStackParamList[RouteName]]
    : never;

/**
 * Navigate to a screen outside of React context.
 * @param args - The screen name and optional params.
 */
export function navigate<RouteName extends keyof RootStackParamList>(
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
export function navigateWithReset<RouteName extends keyof RootStackParamList>(
  ...args: NavigationUtilParams<RouteName>
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: args[0], params: args[1]}]
    });
  }
}

/**
 * Go back to the previous screen outside of React context.
 */
export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

/**
 * Method to retrieve the navigation status.
 * @returns true if the navigation is ready, false otherwise.
 */
export const isNavigationReady = () => navigationRef.isReady();
