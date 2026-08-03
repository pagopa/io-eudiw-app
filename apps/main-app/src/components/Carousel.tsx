import { useInteractiveElementDefaultColorName } from '@io-eudiw-app/commons';
import { IOColors, VSpacer } from '@pagopa/io-app-design-system';
import { forwardRef, useCallback, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';

import { LandingCardComponent } from './LandingCardComponent';

const styles = StyleSheet.create({
  indicatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  normalDot: {
    backgroundColor: IOColors['blueIO-150'],
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8
  }
});

const newDsGrey = IOColors['grey-200'];

type CarouselDotsProps = Omit<
  CarouselProps & {
    dotColor?: string;
    scrollX: Animated.Value;
  },
  'scrollViewRef' | 'setStep'
>;

type CarouselProps = {
  carouselCards: readonly React.ComponentProps<typeof LandingCardComponent>[];
  dotColor?: string;
  dotEasterEggCallback?: () => void;
  scrollViewRef: React.RefObject<null | ScrollView>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Carousel component with dots based on `ScrollView` which shows a list of `LandingCardComponent` horizontally.
 * The three dots can be tapped three times to trigger the dotEasterEggCallback.
 * @param carouselCards - The list of `LandingCardComponent` to show
 * @param dotEasterEggCallback - The callback to call when the user taps the dots three times
 * @param dotColor - The color of the active dot
 * @param scrollViewRef - The ref of the ScrollView
 * @param setStep - The function to call when the user scrolls the ScrollView
 */
const CarouselDots = (props: CarouselDotsProps) => {
  const { carouselCards, dotColor, dotEasterEggCallback, scrollX } = props;
  const dotTouchCount = useRef(0);

  const blueColor = useInteractiveElementDefaultColorName();

  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;

  return (
    <View
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
      onTouchEnd={(_: GestureResponderEvent) => {
        dotTouchCount.current++;
        if (dotTouchCount.current === 3) {
          dotTouchCount.current = 0;
          dotEasterEggCallback?.();
        }
      }}
      style={styles.indicatorContainer}
    >
      {carouselCards.map((_, imageIndex) => {
        const width = scrollX.interpolate({
          extrapolate: 'clamp',
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [8, 16, 8]
        });
        const backgroundColor = scrollX.interpolate({
          extrapolate: 'clamp',
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [newDsGrey, dotColor || blueColor, newDsGrey]
        });
        return (
          <Animated.View
            key={imageIndex}
            style={[styles.normalDot, { backgroundColor, width }]}
          />
        );
      })}
    </View>
  );
};

export const Carousel = forwardRef<View, CarouselProps>((props, ref) => {
  const { carouselCards, dotColor, dotEasterEggCallback } = props;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollEvent = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: {
            x: scrollX
          }
        }
      }
    ],
    { useNativeDriver: false }
  );

  const renderCardComponents = useCallback(
    () =>
      carouselCards.map(p => (
        <LandingCardComponent
          key={`card-${p.id}`}
          ref={p.id === 0 ? ref : null}
          {...p}
        />
      )),
    [carouselCards, ref]
  );

  const cardComponents = renderCardComponents();

  return (
    <>
      <ScrollView
        horizontal={true}
        onScroll={event => {
          props.setStep(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width
          );
          scrollEvent(event);
        }}
        pagingEnabled
        ref={props.scrollViewRef}
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
      >
        {cardComponents}
      </ScrollView>
      <CarouselDots
        carouselCards={carouselCards}
        dotColor={dotColor}
        dotEasterEggCallback={dotEasterEggCallback}
        scrollX={scrollX}
      />
      <VSpacer size={24} />
    </>
  );
});
