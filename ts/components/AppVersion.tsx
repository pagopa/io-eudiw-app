import * as React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import { IOStyles, LabelSmall } from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { WithTestID } from "../types/WithTestID";
import { getAppVersion } from "../utils/appVersion";

export type AppVersion = WithTestID<{
  onPress: (event: GestureResponderEvent) => void;
}>;

const styles = StyleSheet.create({
  versionButton: {
    paddingVertical: 20,
    alignSelf: "flex-start"
  }
});

const AppVersion = ({ onPress, testID }: AppVersion) => {
  const appVersion = getAppVersion();
  const appVersionText = `${I18n.t("profile.main.appVersion")} ${appVersion}`;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityLabel={appVersionText}
    >
      <View style={[styles.versionButton, IOStyles.row, IOStyles.alignCenter]}>
        <LabelSmall numberOfLines={1} weight="SemiBold" color="grey-650">
          {appVersionText}
        </LabelSmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
