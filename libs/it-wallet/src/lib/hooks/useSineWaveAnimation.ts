import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import {
  AnimatedStyle,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

type SineWaveAnimation = {
  animatedStyle: AnimatedStyle<ViewStyle>;
};

type SineWaveConfiguration = {
  axis: 'x' | 'y';
  duration: number;
  enabled?: boolean;
  span: number;
};

/**
 * Hook to use a sine wave animation need for {@link AnimatedCameraMarker} to simulate a wave effect of the camera shutter.
 * @param span - The span of the wave
 * @param duration - The duration of the wave
 * @param axis - The axis of the wave
 * @param enabled - The flag to enable or disable the wave
 * @returns
 */
const useSineWaveAnimation = ({
  axis,
  duration,
  enabled,
  span
}: SineWaveConfiguration): SineWaveAnimation => {
  const translate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      axis === 'x'
        ? { translateX: translate.value }
        : { translateY: translate.value }
    ]
  }));

  useEffect(() => {
    if (enabled) {
      translate.value = withRepeat(
        withSequence(
          withTiming(-span, {
            duration,
            easing: Easing.inOut(Easing.cubic)
          }),
          withTiming(span, {
            duration,
            easing: Easing.inOut(Easing.cubic)
          })
        ),
        -1,
        true
      );
    } else {
      translate.value = withTiming(0, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic)
      });
    }
  }, [translate, span, enabled, duration]);

  return { animatedStyle };
};

export { useSineWaveAnimation };
