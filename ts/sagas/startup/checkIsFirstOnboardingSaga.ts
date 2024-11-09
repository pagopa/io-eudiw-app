import { StackActions } from "@react-navigation/native";
import { call, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../types/utils";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { onBoardingCarouselCompleted } from "../../store/actions/onboarding";
import { isFirstAppRun } from "../../store/reducers/onboarding";

export function* checkIsFirstOnboardingSaga(): Generator<ReduxSagaEffect> {
  // We check whether the user has already open the app at least once
  const isFirstOnboarding = yield* select(isFirstAppRun);

  if (isFirstOnboarding) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      // We use navigate to go to the Onboarding Screen
      StackActions.replace(ROUTES.ONBOARDING)
    );

    const resultAction = yield* take(onBoardingCarouselCompleted);
    return resultAction.payload;
  }
  return;
}
