import * as React from "react";
import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native";
import { OnboardingWallet } from "../../components/screens/OnboardingWallet/OnboardingWallet";

/**
 * A screen that displays info about the wallet app
 */
const CarouselWalletScreen = () => {
  return (
    <SafeAreaView
      style={[IOStyles.flex, { backgroundColor: IOColors["blueIO-600"] }]}
    >
      <OnboardingWallet />
    </SafeAreaView>
  );
};

export default CarouselWalletScreen;
