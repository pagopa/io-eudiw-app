import * as React from "react";
import { View } from "react-native";
import { IOStyles, FooterWithButtons, H4 } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch } from "../../../store/hooks";
import { itwActivationStop } from "../store/actions/itwActivationActions";

/**
 * A hook that returns a function to present the abort wallet activation flow bottom sheet
 */
export const useItwAbortFlow = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <H4 color={"bluegreyDark"} weight={"Regular"}>
        {I18n.t("features.itWallet.issuing.pidPreviewScreen.bottomSheet.body")}
      </H4>
    </View>
  );
  const Footer = () => (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      primary={{
        type: "Outline",
        buttonProps: {
          testID: "FciStopAbortingSignatureTestID",
          onPress: () => dismiss(),
          label: I18n.t(
            "features.itWallet.issuing.pidPreviewScreen.bottomSheet.buttons.back"
          )
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          label: I18n.t(
            "features.itWallet.issuing.pidPreviewScreen.bottomSheet.buttons.cancel"
          ),
          onPress: () => {
            dismiss();
            dispatch(itwActivationStop());
            navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME });
          }
        }
      }}
    />
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuing.pidPreviewScreen.bottomSheet.title"
    ),
    component: <BottomSheetBody />,
    snapPoint: [300],
    footer: <Footer />
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
