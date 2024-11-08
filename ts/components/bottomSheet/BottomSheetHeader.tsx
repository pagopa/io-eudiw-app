import * as React from "react";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  H4,
  IconButton,
  IOColors,
  IOVisualCostants,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import { setAccessibilityFocus } from "../../utils/accessibility";

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault,
    paddingBottom: IOVisualCostants.appMarginDefault,
    backgroundColor: IOColors.white
  }
});

type Props = {
  title: string | React.ReactNode;
  onClose: () => void;
};

export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => {
  const headerRef = React.createRef<View>();

  useEffect(() => {
    setAccessibilityFocus(headerRef, 1000 as Millisecond);
  }, [headerRef]);

  return (
    <View style={styles.bottomSheetHeader} ref={headerRef}>
      {React.isValidElement(title) ? (
        title
      ) : (
        <View
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={"header"}
          accessibilityLabel={typeof title === "string" ? title : undefined}
        >
          <H4>{title}</H4>
        </View>
      )}
      <IconButton
        color="neutral"
        onPress={onClose}
        icon="closeMedium"
        accessibilityLabel={I18n.t("global.buttons.close")}
      />
    </View>
  );
};
