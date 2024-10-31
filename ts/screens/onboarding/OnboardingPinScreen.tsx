import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import { StyleSheet } from "react-native";
import { PinCreation } from "../../components/screens/PinCreation/PinCreation";

/**
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen = () => (
  <SafeAreaView edges={["bottom"]} style={styles.wrapper}>
    <PinCreation isOnboarding />
  </SafeAreaView>
);

export default OnboardingPinScreen;

const styles = StyleSheet.create({
  wrapper: {
    ...IOStyles.flex,
    paddingBottom: 16
  }
});
