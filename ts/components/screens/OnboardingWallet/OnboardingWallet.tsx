import React, { ComponentProps, useCallback } from "react";
import { View } from "react-native";
import {
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  IOColors
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { Carousel } from "../../../screens/authentication/carousel/Carousel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { LandingCardComponent } from "../../LandingCardComponent";

const MAIN_COLOR = "white";
export const OnboardingWallet = () => {
  const navigation = useIONavigation();

  const skipCarousel = useCallback(() => {
    navigation.navigate(ROUTES.ONBOARDING_WALLET_COMPLETE);
  }, [navigation]);

  const carouselCards: ReadonlyArray<
    ComponentProps<typeof LandingCardComponent>
  > = React.useMemo(
    () => [
      {
        id: 0,
        pictogramName: "cie", //TODO-> insert the right pictogram
        title: I18n.t("features.itWallet.onboarding.card1.title"),
        content: I18n.t("features.itWallet.onboarding.card1.content"),
        accessibilityLabel: I18n.t("features.itWallet.onboarding.card1.title"),
        accessibilityHint: I18n.t("features.itWallet.onboarding.card1.content"),
        titleColor: MAIN_COLOR,
        contentColor: MAIN_COLOR
      },
      {
        id: 1,
        pictogramName: "cie", //TODO-> insert the right pictogram
        title: I18n.t("features.itWallet.onboarding.card2.title"),
        content: I18n.t("features.itWallet.onboarding.card2.content"),
        accessibilityLabel: I18n.t("features.itWallet.onboarding.card2.title"),
        accessibilityHint: I18n.t("features.itWallet.onboarding.card2.content"),
        titleColor: MAIN_COLOR,
        contentColor: MAIN_COLOR
      },
      {
        id: 2,
        pictogramName: "cie", //TODO-> insert the right pictogram
        title: I18n.t("features.itWallet.onboarding.card3.title"),
        content: I18n.t("features.itWallet.onboarding.card3.content"),
        accessibilityLabel: I18n.t("features.itWallet.onboarding.card3.title"),
        accessibilityHint: I18n.t("features.itWallet.onboarding.card3.content"),
        titleColor: MAIN_COLOR,
        contentColor: MAIN_COLOR
      }
    ],
    []
  );
  return (
    <>
      <ContentWrapper>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end"
          }}
        >
          <ButtonLink
            testID="skip-button-onboarding-wallet"
            accessibilityLabel="features.itWallet.onboarding.skip"
            color={"contrast"}
            label={I18n.t("features.itWallet.onboarding.skip")}
            onPress={skipCarousel}
          />
        </View>
      </ContentWrapper>
      <Carousel carouselCards={carouselCards} dotColor={IOColors.white} />
      <ContentWrapper>
        <ButtonSolid
          testID="continue-button-onboarding-wallet"
          accessibilityLabel="features.itWallet.onboarding.complete"
          fullWidth={true}
          color={"contrast"}
          label={I18n.t("features.itWallet.onboarding.complete")}
          onPress={skipCarousel}
        />
      </ContentWrapper>
    </>
  );
};
