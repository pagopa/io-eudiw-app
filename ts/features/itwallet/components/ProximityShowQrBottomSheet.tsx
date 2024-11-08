import { VSpacer, Body } from "@pagopa/io-app-design-system";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import I18n from "../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";

const BottomSheetContent = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Image
        source={require("../assets/img/showQrCodeMock.png")}
        accessibilityIgnoresInvertColors
        resizeMode={"contain"}
        style={{ height: 150, width: 150 }}
      />
      <VSpacer size={24} />
      <Body>{I18n.t("global.navigator.show.bottomSheet.body")}</Body>
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
};

export default () =>
  useIOBottomSheetAutoresizableModal({
    title: I18n.t("global.navigator.show.label"),
    component: <BottomSheetContent />
  });
