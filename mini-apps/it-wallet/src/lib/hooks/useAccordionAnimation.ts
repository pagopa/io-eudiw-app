import { IOSpacingScale, IOSpringValues } from '@pagopa/io-app-design-system';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const accordionBodySpacing: IOSpacingScale = 16;

/**
 * Local copy of the design system accordion animation hook, which is no longer
 * exported by the package.
 */
export const useAccordionAnimation = ({
  defaultExpanded = false
}: { defaultExpanded?: boolean } = {}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  // Disable animation when starting expanded
  const animationEnabled = useSharedValue(!defaultExpanded);
  const bodyHeight = useSharedValue(0);

  const toggleAccordion = useCallback(() => {
    animationEnabled.set(true);
    setExpanded(value => !value);
  }, [animationEnabled]);

  const iconAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: withSpring(
            expanded ? '180deg' : '0deg',
            IOSpringValues.accordion
          )
        }
      ]
    }),
    [expanded]
  );

  const onBodyLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && bodyHeight.get() !== height) {
        bodyHeight.set(height);
      }
    },
    [bodyHeight]
  );

  const bodyAnimatedHeight = useAnimatedStyle(() => {
    const nextHeight = expanded ? bodyHeight.value : 0;
    return {
      height: animationEnabled.value
        ? withSpring(nextHeight, IOSpringValues.accordion)
        : nextHeight
    };
  });

  const progress = useDerivedValue(() => {
    const to = expanded ? 1 : 0;
    return animationEnabled.value
      ? withSpring(to, IOSpringValues.accordion)
      : to;
  }, [expanded]);

  return {
    bodyAnimatedStyle: [bodyAnimatedHeight, styles.collapsableContainer],
    bodyInnerStyle: styles.bodyContainer,
    expanded,
    iconAnimatedStyle,
    onBodyLayout,
    progress,
    toggleAccordion
  };
};

const styles = StyleSheet.create({
  bodyContainer: {
    padding: accordionBodySpacing,
    paddingTop: 0,
    position: 'absolute',
    width: '100%'
  },
  collapsableContainer: {
    overflow: 'hidden'
  }
});
