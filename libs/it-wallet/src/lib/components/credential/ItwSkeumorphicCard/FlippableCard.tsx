import { memo, ReactElement } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { createCSSAnimatedComponent } from 'react-native-reanimated';

const CSSAnimatedView = createCSSAnimatedComponent(View);

const DEFAULT_DURATION = 500;

type FlippableCardProps = {
  BackComponent: ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
  duration?: number;
  FrontComponent: ReactElement;
  isFlipped?: boolean;
};

/**
 * Renders a component which can be flipped to show both of its sides with an animation.
 */
const FlippableCard = ({
  BackComponent,
  containerStyle,
  duration = DEFAULT_DURATION,
  FrontComponent,
  isFlipped
}: FlippableCardProps) => (
  <View style={containerStyle}>
    <CSSAnimatedView
      style={[
        styles.card,
        styles.front,
        {
          transform: [{ rotateY: isFlipped ? '180deg' : '0deg' }],
          transitionDuration: duration,
          transitionProperty: 'transform'
        }
      ]}
    >
      {FrontComponent}
    </CSSAnimatedView>
    <CSSAnimatedView
      style={[
        styles.card,
        styles.back,
        {
          transform: [{ rotateY: isFlipped ? '360deg' : '180deg' }],
          transitionDuration: duration,
          transitionProperty: 'transform'
        }
      ]}
    >
      {BackComponent}
    </CSSAnimatedView>
  </View>
);

const styles = StyleSheet.create({
  back: {
    backfaceVisibility: 'hidden',
    zIndex: 2
  },
  card: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  front: {
    backfaceVisibility: 'hidden',
    zIndex: 1
  }
});

const MemoizedFlippableCard = memo(FlippableCard);

export { MemoizedFlippableCard as FlippableCard };
