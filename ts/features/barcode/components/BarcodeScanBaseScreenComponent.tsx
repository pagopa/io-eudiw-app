import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, TabNavigation, TabItem } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { FAQsCategoriesType } from "../../../utils/faq";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType
} from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import I18n from "../../../i18n";
import { useIOBarcodeCameraScanner } from "../hooks/useIOBarcodeCameraScanner";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { CameraPermissionView } from "./CameraPermissionView";

type HelpProps = {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  hideHelpButton?: boolean;
};

type Props = {
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all formats.
   * If the format is not supported it will return an UNSUPPORTED_FORMAT error
   */
  barcodeFormats?: Array<IOBarcodeFormat>;
  /**
   * Accepted barcode types that can be detected. Leave empty to accept all types.
   * If the type is not supported it will return an UNKNOWN_CONTENT error
   */
  barcodeTypes?: Array<IOBarcodeType>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure, origin: IOBarcodeOrigin) => void;
  /**
   * Callback called when the upload file input is pressed, necessary to show the file input modal
   */
  onFileInputPressed: () => void;
  /**
   * Callback called when the manual input button is pressed
   * necessary to navigate to the manual input screen or show the manual input modal
   */
  onManualInputPressed: () => void;
  /**
   * If true, the screen goes into a loading state which disables all interaction and displays a loading indicator
   */
  isLoading?: boolean;
  /**
   * Disables barcode scan capabilities, putting the component in an idle state
   */
  isDisabled?: boolean;
} & HelpProps;

const BarcodeScanBaseScreenComponent = ({
  barcodeFormats,
  barcodeTypes,
  onBarcodeError,
  onBarcodeSuccess,
  isLoading = false,
  isDisabled = false,
  contextualHelpMarkdown
}: Props) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings,
    hasTorch,
    isTorchOn,
    toggleTorch
  } = useIOBarcodeCameraScanner({
    onBarcodeSuccess,
    onBarcodeError,
    barcodeFormats,
    barcodeTypes,
    isDisabled: !isFocused || isDisabled,
    isLoading
  });

  const openAppSetting = React.useCallback(async () => {
    // Open the custom settings if the app has one
    await openCameraSettings();
  }, [openCameraSettings]);

  const cameraView = React.useMemo(() => {
    if (cameraPermissionStatus === "authorized") {
      return cameraComponent;
    }
    if (cameraPermissionStatus === "not-determined") {
      return (
        <CameraPermissionView
          pictogram="cameraRequest"
          title={I18n.t("barcodeScan.permissions.undefined.title")}
          body={I18n.t("barcodeScan.permissions.undefined.label")}
          action={{
            label: I18n.t("barcodeScan.permissions.undefined.action"),
            accessibilityLabel: I18n.t(
              "barcodeScan.permissions.undefined.action"
            ),
            onPress: async () => {
              await requestCameraPermission();
            }
          }}
        />
      );
    }

    return (
      <CameraPermissionView
        pictogram="cameraDenied"
        title={I18n.t("barcodeScan.permissions.denied.title")}
        body={I18n.t("barcodeScan.permissions.denied.label")}
        action={{
          label: I18n.t("barcodeScan.permissions.denied.action"),
          accessibilityLabel: I18n.t("barcodeScan.permissions.denied.action"),
          onPress: async () => {
            await openAppSetting();
          }
        }}
      />
    );
  }, [
    cameraPermissionStatus,
    openAppSetting,
    cameraComponent,
    requestCameraPermission
  ]);

  const handleTorchToggle = useCallback(() => {
    toggleTorch();
  }, [toggleTorch]);

  const shouldDisplayTorchButton =
    cameraPermissionStatus === "authorized" && hasTorch;

  useHeaderSecondLevel({
    title: "",
    transparent: true,
    supportRequest: true,
    contextualHelpMarkdown,
    secondAction: shouldDisplayTorchButton
      ? {
          icon: isTorchOn ? "lightFilled" : "light",
          onPress: handleTorchToggle,
          accessibilityLabel: isTorchOn
            ? I18n.t("accessibility.buttons.torch.turnOff")
            : I18n.t("accessibility.buttons.torch.turnOn")
        }
      : undefined
  });
  return (
    <View style={[styles.screen]}>
      <View style={styles.cameraContainer}>{cameraView}</View>
      <View style={styles.navigationContainer}>
        <TabNavigation tabAlignment="center" selectedIndex={0} color="dark">
          <TabItem
            label={I18n.t("barcodeScan.tabs.scan")}
            accessibilityLabel={I18n.t("barcodeScan.tabs.a11y.scan")}
          />
        </TabNavigation>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IOColors["blueIO-850"]
  },
  headerContainer: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: 160
  },
  cameraContainer: {
    flex: 1,
    flexGrow: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  navigationContainer: {
    paddingVertical: 32
  }
});

export { BarcodeScanBaseScreenComponent };
