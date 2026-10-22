// libs/navigation/src/index.ts
import {
  createNavigationContainerRef,
  StackActions
} from '@react-navigation/native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const navigationRef = createNavigationContainerRef<any>();

export const isNavigationReady = () => navigationRef.isReady();

/**
 * We create a "Factory" or "Wrapper" creator.
 * This forces you to declare your types ONCE per library.
 */
export function createSafeNavigator<
  ParamList extends Record<string, object | undefined>
>() {
  return {
    navigate: <RouteName extends keyof ParamList>(
      ...args: undefined extends ParamList[RouteName]
        ?
            | [screen: RouteName, params: ParamList[RouteName]]
            | [screen: RouteName]
        : [screen: RouteName, params: ParamList[RouteName]]
    ) => {
      if (navigationRef.isReady()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigationRef.navigate(args[0] as any, args[1] as any);
      }
    },

    navigateWithReset: <RouteName extends keyof ParamList>(
      ...args: undefined extends ParamList[RouteName]
        ?
            | [screen: RouteName, params: ParamList[RouteName]]
            | [screen: RouteName]
        : [screen: RouteName, params: ParamList[RouteName]]
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: args[0] as string, params: args[1] }]
        });
      }
    },

    /**
     * Goes back to an existing route of the stack, popping every screen above
     * it. Unlike {@link navigateWithReset} the route is not remounted and the
     * transition is animated as a back navigation. If the route is not in the
     * stack, the current screen is replaced with a new instance of it.
     */
    popTo: <RouteName extends keyof ParamList>(
      ...args: undefined extends ParamList[RouteName]
        ?
            | [screen: RouteName, params: ParamList[RouteName]]
            | [screen: RouteName]
        : [screen: RouteName, params: ParamList[RouteName]]
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          StackActions.popTo(args[0] as string, args[1] as object | undefined)
        );
      }
    }
  };
}
