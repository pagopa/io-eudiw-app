import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from './RootStacknavigator';

/**
 * Navigation reference which can be used to navigate outside of React context.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen outside of React context.
 * @param args - The screen name and optional params.
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: RouteName extends unknown
    ? undefined extends RootStackParamList[RouteName]
      ?
          | [screen: RouteName]
          | [screen: RouteName, params: RootStackParamList[RouteName]]
      : [screen: RouteName, params: RootStackParamList[RouteName]]
    : never
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args);
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
