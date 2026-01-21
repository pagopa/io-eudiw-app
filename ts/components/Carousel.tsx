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
import { useInteractiveElementDefaultColorName } from '../hooks/theme';
import { LandingCardComponent } from './LandingCardComponent';

const styles = StyleSheet.create({
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: IOColors['blueIO-150'],
    marginHorizontal: 4
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const newDsGrey = IOColors['grey-200'];

type CarouselProps = {
  carouselCards: ReadonlyArray<
    React.ComponentProps<typeof LandingCardComponent>
  >;
  dotEasterEggCallback?: () => void;
  dotColor?: string;
  scrollViewRef: React.RefObject<ScrollView | null>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

type CarouselDotsProps = Omit<
  CarouselProps & {
    scrollX: Animated.Value;
    dotColor?: string;
  },
  'scrollViewRef' | 'setStep'
>;

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
  const { carouselCards, dotEasterEggCallback, scrollX, dotColor } = props;
  const dotTouchCount = useRef(0);

  const blueColor = useInteractiveElementDefaultColorName();

  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;

  return (
    <View
      importantForAccessibility="yes"
      accessibilityElementsHidden={false}
      style={styles.indicatorContainer}
      onTouchEnd={(_: GestureResponderEvent) => {
        // eslint-disable-next-line
        dotTouchCount.current++;
        if (dotTouchCount.current === 3) {
          // eslint-disable-next-line
          dotTouchCount.current = 0;
          dotEasterEggCallback?.();
        }
      }}
    >
      {carouselCards.map((_, imageIndex) => {
        const width = scrollX.interpolate({
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [8, 16, 8],
          extrapolate: 'clamp'
        });
        const backgroundColor = scrollX.interpolate({
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [newDsGrey, dotColor || blueColor, newDsGrey],
          extrapolate: 'clamp'
        });
        return (
          <Animated.View
            key={imageIndex}
            style={[styles.normalDot, { width, backgroundColor }]}
          />
        );
      })}
    </View>
  );
};

export const Carousel = forwardRef<View, CarouselProps>((props, ref) => {
  const { carouselCards, dotEasterEggCallback, dotColor } = props;
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
          ref={p.id === 0 ? ref : null}
          key={`card-${p.id}`}
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
        pagingEnabled
        ref={props.scrollViewRef}
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          props.setStep(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width
          );
          scrollEvent(event);
        }}
        scrollEventThrottle={1}
      >
        {cardComponents}
      </ScrollView>
      <CarouselDots
        dotEasterEggCallback={dotEasterEggCallback}
        carouselCards={carouselCards}
        scrollX={scrollX}
        dotColor={dotColor}
      />
      <VSpacer size={24} />
    </>
  );
});
