import * as NAR from "fp-ts/lib/NonEmptyArray";
import * as React from "react";
import { View, Dimensions, StyleSheet, ViewStyle } from "react-native";
import { HSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { Baseline, Bullet } from "./Placeholders";

type Props = Readonly<{
  digits: number;
  activeColor: string;
  inactiveColor: string;
  focusedColor?: string;
  inputValue: string;
  customHorizontalMargin?: number;
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: "row"
  }
});

const screenWidth = Dimensions.get("window").width;

const InputPlaceHolder: React.FunctionComponent<Props> = (props: Props) => {
  const placeholderPositions = NAR.range(0, props.digits - 1);

  const renderPlaceholder = (i: number) => {
    const {
      activeColor,
      inactiveColor,
      focusedColor,
      digits,
      customHorizontalMargin,
      inputValue
    } = props;
    const margin = customHorizontalMargin || 0;

    const isFocused = i === inputValue.length;

    const isPlaceholderPopulated = i < inputValue.length;

    const scalableDimension: ViewStyle = {
      width:
        (screenWidth -
          customVariables.spacerWidth * (digits - 1) -
          customVariables.contentPadding * 2 -
          margin * 2) /
        digits
    };

    return (
      <React.Fragment key={`bullet-${i}`}>
        {isPlaceholderPopulated ? (
          <Bullet
            color={activeColor}
            baselineColor={inactiveColor}
            scalableDimension={scalableDimension}
          />
        ) : (
          <Baseline
            color={isFocused && focusedColor ? focusedColor : inactiveColor}
            scalableDimension={scalableDimension}
          />
        )}
        {i < digits && <HSpacer size={8} />}
      </React.Fragment>
    );
  };

  return (
    <View
      style={styles.placeholderContainer}
      accessible={true}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityHint={I18n.t(
        "identification.unlockCode.accessibility.unlockHint",
        {
          number: props.inputValue.length,
          length: props.digits
        }
      )}
    >
      {placeholderPositions.map(renderPlaceholder)}
    </View>
  );
};

export default InputPlaceHolder;
