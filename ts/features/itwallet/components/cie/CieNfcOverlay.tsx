/**
 * A screen to check if the NFC in enabled on the device.
 * If not, alert/guide the user to activate it from device settings
 */
import * as React from "react";
import { Alert } from "react-native";
import {
  Body,
  FooterWithButtons,
  ContentWrapper
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { ReduxProps } from "../../../../store/actions/types";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { itwOpenNFCSettings } from "../../utils/itwCieUtils";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_PID_CIE_CARD_READER_SCREEN"
>;

type Props = ReduxProps & NavigationProps;

export default function CieNfcOverlay(_: Props) {
  const navigation = useIONavigation();

  const handleOnPressActivateNFC = async () => {
    await itwOpenNFCSettings();
  };

  // FIX ME: the same alert is displayed during all the onboarding
  const handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: () =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
            })
        }
      ]
    );

  useHeaderSecondLevel({
    title: I18n.t("authentication.cie.nfc.enableNfcHeader"),
    goBack: handleGoBack
  });

  return (
    <>
      {/* <ScreenContentHeader
        title={I18n.t("authentication.cie.nfc.enableNfcTitle")}
        rasterIcon={require("../../../../../img/icons/nfc-icon.png")}
      /> */}
      <ContentWrapper>
        <Body>{I18n.t("authentication.cie.nfc.enableNfcContent")}</Body>
      </ContentWrapper>
      <FooterWithButtons
        primary={{
          type: "Outline",
          buttonProps: {
            color: "primary",
            accessibilityLabel: I18n.t("authentication.cie.nfc.enableNfcTitle"),
            onPress: handleOnPressActivateNFC,
            label: I18n.t("authentication.cie.nfc.enableNfcTitle")
          }
        }}
        type="SingleButton"
      />
    </>
  );
}
