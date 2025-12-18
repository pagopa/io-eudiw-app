/**
 * This component renders the card displayed in the landing page carousel
 */

import {View, ScrollView, useWindowDimensions, StyleSheet} from 'react-native';
import {
  Body,
  H3,
  IOColors,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import {forwardRef} from 'react';

type Props = {
  id: number;
  pictogramName: IOPictograms;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  titleColor?: IOColors;
  contentColor?: IOColors;
  pictogramStyle?: React.ComponentProps<typeof Pictogram>['pictogramStyle'];
};

/**
 * Cards displayed through the {@link Carousel.tsx} component. Each card contains a pictogram, a title and a content and can be customized.
 * @param id - The id of the card
 * @param pictogramName - The name of the pictogram to be displayed
 * @param title - The title of the card
 * @param content - The content of the card
 * @param accessibilityLabel - The accessibility label for the card
 * @param accessibilityHint - The accessibility hint for the card
 * @param titleColor - The color of the `title` prop
 * @param contentColor - The color of the `content` prop
 * @param pictogramStyle - The style of the pictogram
 */
export const LandingCardComponent = forwardRef<View, Props>((props, ref) => {
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
        style={[wrapperStyle, styles.wrapper]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}>
        <Pictogram
          size={180}
          name={pictogramName}
          pictogramStyle={pictogramStyle}
        />
        <VSpacer />
        <H3
          importantForAccessibility="no"
          style={styles.centeredText}
          color={titleColor}>
          {title}
        </H3>
        <VSpacer />
        <Body
          importantForAccessibility="no"
          style={styles.centeredText}
          color={contentColor}>
          {content}
        </Body>
        <VSpacer />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  centeredText: {textAlign: 'center'},
  container: {flexGrow: 1, justifyContent: 'center'},
  wrapper: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    alignItems: 'center'
  }
});
