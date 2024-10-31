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
import { MainTabParamsList } from "./MainTabParamsList";
import { OnboardingParamsList } from "./OnboardingParamsList";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>;
  [ROUTES.UNSUPPORTED_DEVICE]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  [ROUTES.MAIN]: NavigatorScreenParams<MainTabParamsList>;
  [ITW_ROUTES.MAIN]: NavigatorScreenParams<ItwParamsList>;
  [ROUTES.ONBOARDING_WALLET]: undefined;
  [ROUTES.ONBOARDING_PIN]: undefined;
  [ROUTES.ONBOARDING_WALLET_COMPLETE]: undefined;
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
