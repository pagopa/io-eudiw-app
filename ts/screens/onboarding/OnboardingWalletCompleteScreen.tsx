import * as React from "react";
import { useDispatch } from "react-redux";
import {
  ButtonSolid,
  ButtonText,
  IOStyles
} from "@pagopa/io-app-design-system";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import { onBoardingCarouselCompleted } from "../../store/actions/onboarding";
import I18n from "../../i18n";
/**
 * A screen where the user can start using Wallet
 */
const OnboardingWalletCompleteScreen = () => {
  const dispatch = useDispatch();

  const onContinue = React.useCallback(
    () => dispatch(onBoardingCarouselCompleted()),
    [dispatch]
  );

  const onCloseApp = React.useCallback(() => {}, []);

  return (
    <SafeAreaView style={IOStyles.flex}>
      <OperationResultScreenContent
        pictogram="cie"
        isHeaderVisible={false}
        title={I18n.t("features.itWallet.onboarding.completeTitle")}
        subtitle={I18n.t("features.itWallet.onboarding.completeDescription")}
      />

      <View style={styles.footer}>
        <ButtonSolid
          label={I18n.t("features.itWallet.onboarding.complete")}
          fullWidth
          onPress={onContinue}
        />
        <View style={{ alignItems: "center" }}>
          <ButtonText color="blueIO-600">
            {I18n.t("features.itWallet.onboarding.closeApp")}
          </ButtonText>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingWalletCompleteScreen;

const styles = StyleSheet.create({
  footer: { ...IOStyles.horizontalContentPadding, rowGap: 16 }
});
