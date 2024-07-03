import React from "react";
import { CommonActions } from "@react-navigation/native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOToast } from "@pagopa/io-app-design-system";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeType,
  IO_BARCODE_ALL_FORMATS,
  IO_BARCODE_ALL_TYPES
} from "../types/IOBarcode";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { itWalletEnabled } from "../../../config";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../../itwallet/navigation/ItwRoutes";
import I18n from "../../../i18n";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";

const BarcodeScanScreen = () => {
  const barcodeFormats: Array<IOBarcodeFormat> = IO_BARCODE_ALL_FORMATS.map(
    format => format
  );

  const barcodeTypes: Array<IOBarcodeType> = IO_BARCODE_ALL_TYPES.filter(type =>
    type === "ITWALLET" ? itWalletEnabled : true
  );

  /**
   * Handles a single barcode and navigates to the correct screen.
   * @param barcode Scanned barcode
   */
  const handleSingleBarcode = (barcode: IOBarcode) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);
    switch (barcode.type) {
      case "ITWALLET":
        const params = {
          authReqUrl: barcode.requestUri,
          clientId: barcode.clientId
        };
        NavigationService.dispatchNavigationAction(
          CommonActions.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.PID.REMOTE.INIT,
            params
          })
        );
        break;
    }
  };

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    if (barcodes.length > 0) {
      handleSingleBarcode(barcodes[0]);
    }
  };

  const handleBarcodeError = () => {
    IOToast.error(I18n.t("barcodeScan.error"));
  };

  return (
    <BarcodeScanBaseScreenComponent
      barcodeFormats={barcodeFormats}
      barcodeTypes={barcodeTypes}
      onBarcodeSuccess={handleBarcodeSuccess}
      onBarcodeError={handleBarcodeError}
      onFileInputPressed={() => {}}
      onManualInputPressed={() => {}}
      contextualHelp={emptyContextualHelp}
      isLoading={false}
      isDisabled={false}
    />
  );
};

export { BarcodeScanScreen };
