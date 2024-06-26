/**
 * A screen to alert the user about the number of attempts remains
 */
import { constNull } from "fp-ts/lib/function";
import React, { useState } from "react";
import { Linking, Platform, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  FooterWithButtons,
  ContentWrapper,
  IOStyles,
  Body
} from "@pagopa/io-app-design-system";
import { ScreenContentHeader } from "../../../../../../components/screens/ScreenContentHeader";
import I18n from "../../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";

// TODO: swap <Body> with <Markdown>

const ItwCiePinLockedTemporarilyScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  const getContextualHelp = () => ({
    title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
    body: () => (
      <Body>{I18n.t("authentication.cie.pin.contextualHelpBody")}</Body>
    )
  });

  const handleGoBack = () =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
    });

  useHeaderSecondLevel({
    title: I18n.t("authentication.cie.pinTempLocked.header"),
    contextualHelp: getContextualHelp(),
    supportRequest: true,
    goBack: handleGoBack
  });

  const goToCieID = () => {
    Linking.openURL(
      Platform.select({
        ios: "https://apps.apple.com/it/app/cieid/id1504644677",
        default: "https://play.google.com/store/apps/details?id=it.ipzs.cieid"
      })
    ).catch(constNull);
  };

  const renderFooterButtons = () => (
    <FooterWithButtons
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: handleGoBack,
          label: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("authentication.cie.pinTempLocked.button"),
          onPress: goToCieID,
          label: I18n.t("authentication.cie.pinTempLocked.button")
        }
      }}
      type="TwoButtonsInlineThird"
    />
  );

  return (
    <>
      <ScreenContentHeader
        title={I18n.t("authentication.cie.pinTempLocked.title")}
      />
      <View style={IOStyles.flex}>
        <ContentWrapper>
          <Body
          /*  onLoadEnd={() => {
              setIsLoadingCompleted(true);
            }} */
          >
            {I18n.t("authentication.cie.pinTempLocked.content")}
          </Body>
        </ContentWrapper>
      </View>

      {isLoadingCompleted && renderFooterButtons()}
    </>
  );
};

export default ItwCiePinLockedTemporarilyScreen;
