import { IOAppMargin, WithTestID } from '@pagopa/io-app-design-system';
import {
  forwardRef,
  JSXElementConstructor,
  ReactElement,
  Ref,
  useCallback,
  useMemo
} from 'react';
import {
  Dimensions,
  FlatList,
  FlatListProps,
  StyleSheet,
  View
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;

type Nullable<T> = null | T;

type Props<T> = Pick<
  FlatListProps<T>,
  | 'contentContainerStyle'
  | 'decelerationRate'
  | 'initialScrollIndex'
  | 'keyExtractor'
  | 'onViewableItemsChanged'
  | 'pagingEnabled'
  | 'scrollEnabled'
  | 'snapToAlignment'
  | 'style'
  | 'viewabilityConfig'
> & {
  Component: JSXElementConstructor<T>;
  data: T[];
  itemsGap?: 0 | IOAppMargin;
  itemsPerTime?: number;
};

/**
 * This component renders a carousel of elements from a given `data` entry and a `Component` of your choice. It's based on the `FlatList` component.
 * It allows you to define how many items to display at a time, how many space between the rendered elements and other important features inherited from the `FlatList` component.
 * @param data - The array used to build the carousel items
 * @param Component - The component used to render the single item
 * @param itemsGap - The horizontal space between carousel items
 * @param itemsPerTime - The number of items displayed simultaneously
 */
function CarouselComponent<T extends Record<string, unknown>>(
  {
    Component,
    contentContainerStyle,
    data,
    decelerationRate,
    initialScrollIndex,
    itemsGap = 0,
    itemsPerTime = 1,
    keyExtractor,
    onViewableItemsChanged,
    pagingEnabled,
    scrollEnabled = true,
    snapToAlignment,
    style,
    testID,
    viewabilityConfig
  }: WithTestID<Props<T>>,
  ref: Ref<FlatList<T>>
) {
  const snapToInterval = useMemo(
    () => WINDOW_WIDTH - itemsGap * itemsPerTime,
    [itemsGap, itemsPerTime]
  );

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <View
        style={{
          marginRight: itemsGap,
          width:
            data.length === 1 && itemsPerTime === 1
              ? WINDOW_WIDTH
              : WINDOW_WIDTH / itemsPerTime - itemsGap * 2
        }}
      >
        <Component {...item} />
      </View>
    ),
    [Component, data, itemsGap, itemsPerTime]
  );

  const getItemLayout = useCallback(
    (_: Nullable<ArrayLike<T>> | undefined, index: number) => ({
      index,
      length: WINDOW_WIDTH,
      offset: WINDOW_WIDTH * index
    }),
    []
  );

  return (
    <FlatList
      contentContainerStyle={contentContainerStyle}
      data={data}
      decelerationRate={decelerationRate}
      getItemLayout={getItemLayout}
      horizontal
      initialScrollIndex={initialScrollIndex}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
      pagingEnabled={pagingEnabled}
      ref={ref}
      renderItem={renderItem}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      snapToAlignment={snapToAlignment}
      snapToInterval={snapToInterval}
      style={[style, styles.box]}
      testID={testID}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'visible' }
});

export const CarouselFlat = forwardRef(CarouselComponent) as <T>(
  p: WithTestID<Props<T>> & { ref?: Ref<FlatList<T>> }
) => ReactElement;
