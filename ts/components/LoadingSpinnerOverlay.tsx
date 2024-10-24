import {
  ButtonOutline,
  IOColors,
  hexToRgba,
  Body,
  IOStyles
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../i18n";
import BoxedRefreshIndicator from "./ui/BoxedRefreshIndicator";
import { Overlay } from "./ui/Overlay";

const styles = StyleSheet.create({
  textCaption: {
    padding: 24
  }
});

type Props = Readonly<{
  children?: React.ReactNode;
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay spinner conditionally
 */
const LoadingSpinnerOverlay = ({
  children,
  isLoading,
  loadingCaption,
  loadingOpacity = 0.7,
  onCancel
}: Props) => (
  <Overlay
    backgroundColor={hexToRgba(IOColors.white, loadingOpacity)}
    foreground={
      isLoading && (
        <BoxedRefreshIndicator
          caption={
            <View style={styles.textCaption}>
              <Body accessible={true} style={{ textAlign: "center" }}>
                {loadingCaption ||
                  I18n.t("global.remoteStates.wait", { defaultValue: "..." })}
              </Body>
            </View>
          }
          action={
            onCancel && (
              <View style={IOStyles.selfCenter}>
                <ButtonOutline
                  accessibilityLabel={I18n.t("global.buttons.cancel")}
                  onPress={onCancel}
                  testID="loadingSpinnerOverlayCancelButton"
                  label={I18n.t("global.buttons.cancel")}
                />
              </View>
            )
          }
        />
      )
    }
  >
    {children}
  </Overlay>
);

export default LoadingSpinnerOverlay;
