import * as React from "react";
import { useDispatch } from "react-redux";
import {
  ButtonSolid,
  ButtonText,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { onBoardingCarouselCompleted } from "../../store/actions/onboarding";
import I18n from "../../i18n";
import ItwTextInfo from "../../features/itwallet/components/ItwTextInfo";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
/**
 * A screen where the user can start using Wallet
 */
const CarouselWalletCompleteScreen = () => {
  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const onContinue = React.useCallback(
    () => dispatch(onBoardingCarouselCompleted()),
    [dispatch]
  );

  const onCloseApp = React.useCallback(() => {
    navigation.navigate(ROUTES.ONBOARDING_WALLET);
  }, [navigation]);

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View
        style={[IOStyles.alignCenter, IOStyles.flex, IOStyles.centerJustified]}
      >
        <View style={[IOStyles.alignCenter]}>
          <Pictogram name="cie" size={120} />
          <VSpacer size={24} />
          <H3 style={styles.text}>
            {I18n.t("features.itWallet.onboarding.completeTitle")}
          </H3>
          <VSpacer size={8} />
          <View style={[IOStyles.horizontalContentPadding]}>
            <ItwTextInfo
              textStyle={styles.text}
              content={I18n.t(
                "features.itWallet.onboarding.completeDescription"
              )}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ButtonSolid
          label={I18n.t("features.itWallet.onboarding.complete")}
          fullWidth
          onPress={onContinue}
        />
        <View style={{ alignItems: "center" }}>
          <ButtonText color="blueIO-600" onPress={onCloseApp}>
            {I18n.t("features.itWallet.onboarding.closeApp")}
          </ButtonText>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CarouselWalletCompleteScreen;

const styles = StyleSheet.create({
  footer: { ...IOStyles.horizontalContentPadding, rowGap: 16 },
  text: { textAlign: "center" }
});
