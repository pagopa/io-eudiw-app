/**
 * This component renders the card displayed in the landing page carousel
 */

import * as React from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet
} from "react-native";
import {
  Body,
  H3,
  IOColors,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

type Props = {
  id: number;
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  titleColor?: IOColors;
  contentColor?: IOColors;
  pictogramStyle?: React.ComponentProps<typeof Pictogram>["pictogramStyle"];
};

const VERTICAL_SPACING = 16;

export const LandingCardComponent = React.forwardRef<View, Props>(
  (props, ref) => {
    const screenDimension = useWindowDimensions();
    const screenWidth = screenDimension.width;
    const wrapperStyle = {
      width: screenWidth
    };
    const {
      accessibilityLabel,
      accessibilityHint,
      pictogramName,
      title,
      content,
      titleColor,
      contentColor,
      pictogramStyle
    } = props;

    return (
      <ScrollView accessible={false} contentContainerStyle={styles.container}>
        <View
          ref={ref}
          style={[
            wrapperStyle,
            IOStyles.horizontalContentPadding,
            IOStyles.alignCenter
          ]}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          <Pictogram
            size={180}
            name={pictogramName}
            pictogramStyle={pictogramStyle}
          />
          <VSpacer size={VERTICAL_SPACING} />
          <H3
            importantForAccessibility="no"
            style={styles.centeredText}
            color={titleColor}
          >
            {title}
          </H3>
          <VSpacer size={VERTICAL_SPACING} />
          <Body
            importantForAccessibility="no"
            style={styles.centeredText}
            color={contentColor}
          >
            {content}
          </Body>
          <VSpacer size={VERTICAL_SPACING} />
        </View>
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  centeredText: { textAlign: "center" },
  container: { flexGrow: 1, justifyContent: "center" }
});
