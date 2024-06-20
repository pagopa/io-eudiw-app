/**
 * A screen to alert the user about the number of attempts remains
 */
import * as React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import type { Route } from "@react-navigation/core";
import {
  Body,
  FooterWithButtons,
  VSpacer,
  ContentWrapper,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { ScreenContentHeader } from "../../../../../../components/screens/ScreenContentHeader";

export type ItwCieWrongPinScreenNavigationParams = {
  remainingCount: number;
};

type ItwCieWrongPinScreenRouteProps = Route<
  "ITW_ISSUANCE_PID_CIE_WRONG_PIN_SCREEN",
  ItwCieWrongPinScreenNavigationParams
>;

const ItwCieWrongPinScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const route = useRoute<ItwCieWrongPinScreenRouteProps>();

  useHeaderSecondLevel({
    title: I18n.t("authentication.cie.pin.incorrectCiePinHeaderTitle"),
    supportRequest: true
  });

  // TODO: use redux to handle control?
  const navigateToCiePinScreen = async () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.CIE.PIN_SCREEN
    });
  };

  const resetAuthentication = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
    });
  };

  const renderFooterButtons = () => (
    <FooterWithButtons
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: resetAuthentication,
          label: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: navigateToCiePinScreen,
          label: I18n.t("global.buttons.retry")
        }
      }}
      type="TwoButtonsInlineHalf"
    />
  );

  return (
    <>
      <ScreenContentHeader
        title={I18n.t("authentication.cie.pin.incorrectCiePinTitle", {
          remainingCount: route.params.remainingCount
        })}
      />

      <View style={IOStyles.flex}>
        <ContentWrapper>
          <Body>
            {I18n.t("authentication.cie.pin.incorrectCiePinContent1")}
          </Body>
          <VSpacer size={16} />
          <Body>
            {I18n.t("authentication.cie.pin.incorrectCiePinContent2")}
          </Body>
          <VSpacer size={16} />
        </ContentWrapper>
      </View>

      {renderFooterButtons()}
    </>
  );
};

export default ItwCieWrongPinScreen;
