import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Platform, StyleSheet, View, Text, Pressable } from "react-native";
import {
  IOColors,
  IOIconSizeScale,
  IOIcons,
  Icon,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "../../../../../theme/fonts";

// left -> the string to represent as text
// right -> the icon to represent with name and size
export type DigitRpr = E.Either<
  string,
  { name: IOIcons; size: IOIconSizeScale; accessibilityLabel: string }
>;
type Digit = ITuple2<DigitRpr, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
  isDisabled: boolean;
}>;

// it generate buttons width of 56
const radius = 18;
const BUTTON_DIAMETER = 56;
const opaqueButtonBackground = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  roundButton: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 0,
    marginBottom: 16,
    alignSelf: "center",
    justifyContent: "center",
    width: BUTTON_DIAMETER,
    height: BUTTON_DIAMETER,
    borderRadius: BUTTON_DIAMETER / 2,
    backgroundColor: opaqueButtonBackground
  },
  transparent: {
    backgroundColor: "transparent"
  },
  buttonTextBase: {
    ...makeFontStyleObject(Platform.select, "300"),
    fontSize: 30,
    lineHeight: 32,
    marginBottom: -10
  },
  buttonTextLabel: {
    fontSize: radius - 5
  },
  noPadded: {
    paddingRight: 0
  },
  row: {
    flexDirection: "row",
    gap: 16
  },
  grid: {
    alignItems: "center",
    gap: 4
  }
});

const renderPinCol = (
  label: DigitRpr,
  handler: () => void,
  style: "digit" | "label",
  key: string,
  buttonType: "primary" | "light",
  isDisabled: boolean
) => {
  const buttonStyle =
    style === "digit"
      ? styles.roundButton
      : style === "label"
      ? [styles.roundButton, styles.transparent]
      : undefined;

  const accessibilityLabel = pipe(
    label,
    E.fold(
      () => undefined,
      ic => ic.accessibilityLabel
    )
  );

  return (
    <View key={key}>
      <Pressable
        onPress={handler}
        disabled={isDisabled}
        style={[{ alignItems: "center" }, buttonStyle]}
        accessibilityLabel={accessibilityLabel}
      >
        {pipe(
          label,
          E.fold(
            l => (
              <Text
                // white={style === "label" && buttonType === "primary"}
                style={[
                  styles.buttonTextBase,
                  style === "label" && styles.buttonTextLabel
                ]}
              >
                {l}
              </Text>
            ),
            ic => (
              <View style={styles.noPadded}>
                <Icon
                  name={ic.name}
                  size={ic.size}
                  color={buttonType === "light" ? "blue" : "white"}
                />
              </View>
            )
          )
        )}
      </Pressable>
    </View>
  );
};

const renderPinRow = (
  digits: ReadonlyArray<Digit>,
  key: string,
  buttonType: "primary" | "light",
  isDisabled: boolean
) => (
  <View key={key} style={styles.row}>
    {digits.map((el, i) =>
      el ? (
        renderPinCol(
          el.e1,
          el.e2,
          E.isLeft(el.e1) ? "digit" : "label",
          `pinpad-digit-${i}`,
          buttonType,
          isDisabled
        )
      ) : (
        <View key={`pinpad-empty-${i}`} />
      )
    )}
  </View>
);

/**
 * Renders a virtual key pad.
 *
 * This component is used for typing PINs
 */
export class KeyPad extends React.PureComponent<Props> {
  public render() {
    return (
      <View style={styles.grid}>
        {this.props.digits.map((r, i) =>
          renderPinRow(
            r,
            `pinpad-row-${i}`,
            this.props.buttonType,
            this.props.isDisabled
          )
        )}
      </View>
    );
  }
}
