/**
 * This component renders the card displayed in the landing page carousel
 */

import {
  Body,
  H3,
  IOColors,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import { forwardRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  content: string;
  contentColor?: IOColors;
  id: number;
  pictogramName: IOPictograms;
  pictogramStyle?: React.ComponentProps<typeof Pictogram>['pictogramStyle'];
  title: string;
  titleColor?: IOColors;
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
    accessibilityHint,
    accessibilityLabel,
    content,
    contentColor,
    pictogramName,
    pictogramStyle,
    title,
    titleColor
  } = props;

  return (
    <ScrollView accessible={false} contentContainerStyle={styles.container}>
      <View
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessible={true}
        ref={ref}
        style={[wrapperStyle, styles.wrapper]}
      >
        <Pictogram
          name={pictogramName}
          pictogramStyle={pictogramStyle}
          size={180}
        />
        <VSpacer />
        <H3
          color={titleColor}
          importantForAccessibility="no"
          style={styles.centeredText}
        >
          {title}
        </H3>
        <VSpacer />
        <Body
          color={contentColor}
          importantForAccessibility="no"
          style={styles.centeredText}
        >
          {content}
        </Body>
        <VSpacer />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  centeredText: { textAlign: 'center' },
  container: { flexGrow: 1, justifyContent: 'center' },
  wrapper: {
    alignItems: 'center',
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});
