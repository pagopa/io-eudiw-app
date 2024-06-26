import * as React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Body,
  FooterWithButtons,
  LabelLink,
  VSpacer,
  ContentWrapper,
  IOStyles
} from "@pagopa/io-app-design-system";
import { ScreenContentHeader } from "../../../../../../components/screens/ScreenContentHeader";
import { openLink } from "../../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../../i18n";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";

const bookingUrl = I18n.t("cie.booking_url");
const browseToLink = () => openLink(bookingUrl);

const ItwCieExpiredOrInvalidScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  const handleGoBack = () =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
    });

  useHeaderSecondLevel({
    title: I18n.t("authentication.landing.expiredCardHeaderTitle"),
    supportRequest: true,
    goBack: handleGoBack
  });

  return (
    <>
      <ScreenContentHeader
        title={I18n.t("authentication.landing.expiredCardTitle")}
      />
      <View style={IOStyles.flex}>
        <ContentWrapper>
          <Body>{I18n.t("authentication.landing.expiredCardContent")}</Body>
          <VSpacer size={16} />
          <LabelLink onPress={browseToLink}>
            {I18n.t("authentication.landing.expiredCardHelp")}
          </LabelLink>
        </ContentWrapper>
      </View>
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
        type="SingleButton"
      />
    </>
  );
};

export default ItwCieExpiredOrInvalidScreen;
