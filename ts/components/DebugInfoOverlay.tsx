import * as React from "react";
import { StyleSheet, Pressable, SafeAreaView, View, Text } from "react-native";
import { useState } from "react";
import {
  IOColors,
  IOStyles,
  hexToRgba,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import { useIOSelector } from "../store/hooks";
import { currentRouteSelector } from "../store/reducers/navigation";

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFillObject,
    top: -8,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },
  versionText: {
    fontSize: 12,
    color: IOColors["grey-850"],
    ...makeFontStyleObject("Semibold")
  },
  screenDebugText: {
    fontSize: 12,
    color: IOColors["grey-850"],
    ...makeFontStyleObject("Regular")
  },
  versionTextWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: debugItemBgColor
  },
  routeText: {
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    borderRadius: 8,
    maxWidth: "80%",
    paddingHorizontal: 8,
    backgroundColor: debugItemBgColor,
    marginTop: 4
  }
});

const DebugInfoOverlay = () => {
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);
  const screenNameDebug = useIOSelector(currentRouteSelector);

  const appVersionText = `v. ${appVersion}`;

  return (
    <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
      <View style={IOStyles.row}>
        <Pressable
          style={styles.versionTextWrapper}
          onPress={() => setShowRootName(prevState => !prevState)}
          accessibilityRole="button"
          accessibilityLabel={appVersionText}
          accessibilityHint={"Tap here to show/hide the root name"}
        >
          <Text style={styles.versionText}>{appVersionText}</Text>
        </Pressable>
      </View>
      {showRootName && (
        <Pressable
          style={styles.routeText}
          accessibilityRole="button"
          accessibilityHint={"Copy the technical screen name"}
          onPress={() => clipboardSetStringWithFeedback(screenNameDebug)}
        >
          <Text style={styles.screenDebugText}>{screenNameDebug}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

export default DebugInfoOverlay;
