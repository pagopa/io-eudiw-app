import { useCallback, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle } from 'react-native';

type LayoutSize = Pick<LayoutRectangle, 'height' | 'width'>;

/**
 * Custom hook to manage layout size state, providing a setter that only updates
 * the state when the new size differs from the current size to prevent unnecessary
 * re-renders.
 */
export const useLayoutSize = (
  initialSize: LayoutSize = { height: 0, width: 0 }
) => {
  const [size, setSize] = useState<LayoutSize>(initialSize);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      setSize(p =>
        p.width === width && p.height === height ? p : { height, width }
      );
    },
    [setSize]
  );

  return { onLayout: handleLayout, size };
};
