import * as React from "react";
import { Image, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import {
  ButtonSolidProps,
  VSpacer,
  IOStyles
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../../../../i18n";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { useIODispatch } from "../../../../../store/hooks";
import { itwActivationStop } from "../../../store/actions/itwActivationActions";
import ItwTextInfo from "../../../components/ItwTextInfo";
import itwHeroImage from "../../../assets/img/issuing/itw_hero.png";
import itwCardImage from "../../../assets/img/issuing/itw_card.png";
import ItwFooterVerticalButtons from "../../../components/ItwFooterVerticalButtons";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";

const ItwIssuancePidInfoScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  const bottomButtonProps: ButtonSolidProps = {
    fullWidth: true,
    color: "contrast",
    label: I18n.t("features.itWallet.activationScreen.cancel"),
    accessibilityLabel: I18n.t("features.itWallet.activationScreen.cancel"),
    onPress: () => {
      dispatch(itwActivationStop());
    }
  };

  const topButtonProps: ButtonSolidProps = {
    color: "primary",
    fullWidth: true,
    accessibilityLabel: I18n.t("features.itWallet.activationScreen.confirm"),
    onPress: () => navigation.navigate(ITW_ROUTES.ISSUANCE.PID.AUTH),
    label: I18n.t("features.itWallet.activationScreen.confirm")
  };

  return (
    <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
      <ScrollView>
        {/* Header card image */}
        <Image
          source={itwHeroImage}
          style={{ width: "100%" }}
          accessibilityIgnoresInvertColors
        />
        <VSpacer size={24} />

        <View style={IOStyles.horizontalContentPadding}>
          {/* Detail infobox */}
          <ItwTextInfo
            content={I18n.t("features.itWallet.activationScreen.intro")}
          />
          <VSpacer size={24} />

          {/* Online infobox */}
          <ItwTextInfo
            content={I18n.t("features.itWallet.activationScreen.subContentOne")}
          />
          <VSpacer size={24} />

          {/* Hero card image */}
          <Image
            source={itwCardImage}
            style={{ width: "100%" }}
            accessibilityIgnoresInvertColors
          />
          <VSpacer size={24} />

          {/* Info activation */}
          <ItwTextInfo
            content={I18n.t("features.itWallet.activationScreen.subContentTwo")}
          />
        </View>
      </ScrollView>
      <VSpacer size={24} />
      <ItwFooterVerticalButtons
        topButtonProps={topButtonProps}
        bottomButtonProps={bottomButtonProps}
      />
    </SafeAreaView>
  );
};

export default ItwIssuancePidInfoScreen;
