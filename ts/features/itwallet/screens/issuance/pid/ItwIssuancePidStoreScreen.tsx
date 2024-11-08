import React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ButtonSolid,
  H3,
  IOStyles,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 */
const ItwIssuancePidStoreScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View
        style={[
          IOStyles.flex,
          IOStyles.alignCenter,
          IOStyles.centerJustified,
          IOStyles.horizontalContentPadding
        ]}
      >
        <Pictogram name="success" size={180} />
        <VSpacer size={24} />
        <H3>
          {I18n.t("features.itWallet.issuing.pidActivationScreen.typ.title")}
        </H3>
        <VSpacer size={8} />
        <LabelSmall
          color="grey-650"
          weight="Regular"
          style={styles.description}
        >
          {I18n.t("features.itWallet.issuing.pidActivationScreen.typ.content")}
        </LabelSmall>
        <VSpacer size={32} />
        <View style={[IOStyles.alignCenter, IOStyles.centerJustified]}>
          <ButtonSolid
            label={I18n.t(
              "features.itWallet.issuing.pidActivationScreen.typ.button"
            )}
            accessibilityLabel={I18n.t(
              "features.itWallet.issuing.pidActivationScreen.typ.button"
            )}
            onPress={() =>
              navigation.navigate(ROUTES.MAIN, {
                screen: ROUTES.ITWALLET_HOME
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ItwIssuancePidStoreScreen;

const styles = StyleSheet.create({
  description: {
    textAlign: "center"
  }
});
