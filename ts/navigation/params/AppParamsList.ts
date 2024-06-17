import {
  useNavigation,
  ParamListBase,
  RouteProp,
  NavigatorScreenParams
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import ROUTES from "../routes";
import { ITW_ROUTES } from "../../features/itwallet/navigation/ItwRoutes";
import { ItwParamsList } from "../../features/itwallet/navigation/ItwParamsList";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.UNSUPPORTED_DEVICE]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  [ROUTES.MAIN]: undefined;
  [ITW_ROUTES.MAIN]: NavigatorScreenParams<ItwParamsList>;
};

/**
 * Merge the navigation of the ParamList stack with AppParamsList, in order to allow
 * the navigation in the same stack and the global stack.
 * This should be used in the new react-navigation v5 navigator
 */
export type IOStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IOStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IOStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<AppParamsList & ParamList, RouteName>;

export const useIONavigation = () =>
  useNavigation<IOStackNavigationProp<AppParamsList, keyof AppParamsList>>();
