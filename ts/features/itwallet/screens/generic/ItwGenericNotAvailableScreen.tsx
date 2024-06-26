import { FooterWithButtons, IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { BlockButtonProps } from "@pagopa/io-app-design-system/lib/typescript/components/layout/BlockButtons";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import ItwKoView from "../../components/ItwKoView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

const ItwGenericNotAvailableScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.missingFeatureScreen.headerTitle")
  });

  const ContentView = () => (
    <ItwKoView
      title={I18n.t("features.itWallet.missingFeatureScreen.title")}
      subtitle={I18n.t("features.itWallet.missingFeatureScreen.subtitle")}
      pictogram="empty"
      action={{
        label: I18n.t("features.itWallet.missingFeatureScreen.button.label"),
        accessibilityLabel: I18n.t(
          "features.itWallet.missingFeatureScreen.button.label"
        ),
        onPress: () => navigation.goBack()
      }}
    />
  );

  /**
   * Buttons props for the FooterWithButtons component which goes back to the previous screen.
   */
  const ButtonProps: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      label: I18n.t("features.itWallet.missingFeatureScreen.button.label"),
      accessibilityLabel: I18n.t(
        "features.itWallet.missingFeatureScreen.button.label"
      ),
      onPress: () => navigation.goBack()
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
      <View style={{ flexGrow: 1 }}>
        <ContentView />
        <FooterWithButtons primary={ButtonProps} type="SingleButton" />
      </View>
    </SafeAreaView>
  );
};

export default ItwGenericNotAvailableScreen;
