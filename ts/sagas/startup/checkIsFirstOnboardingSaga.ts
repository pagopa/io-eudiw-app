import { StackActions } from "@react-navigation/native";
import { call, put, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../types/utils";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import {
  firstOnboardingCompleted,
  onBoardingCarouselCompleted
} from "../../store/actions/onboarding";
import { isFirstAppRun } from "../../store/reducers/onboarding";
import { deletePin } from "../../utils/keychain";

export function* checkIsFirstOnboardingSaga(): Generator<ReduxSagaEffect> {
  // We check whether the user has already open the app at least once
  const isFirstOnboarding = yield* select(isFirstAppRun);

  if (isFirstOnboarding) {
    // Reset pin if it exists because on iOS keychain perstitence survives app deletion
    yield* call(deletePin);
    yield* call(
      NavigationService.dispatchNavigationAction,
      // We use navigate to go to the Onboarding Screen
      StackActions.replace(ROUTES.ONBOARDING)
    );

    const resultAction = yield* take(onBoardingCarouselCompleted);
    yield* put(firstOnboardingCompleted());
    return resultAction.payload;
  }
  return;
}
