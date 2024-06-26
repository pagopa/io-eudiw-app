import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";

export const navigateToOnboardingPinScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_PIN
    })
  );
