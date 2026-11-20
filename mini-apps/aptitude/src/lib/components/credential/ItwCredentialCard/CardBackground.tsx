import { IOColors } from '@pagopa/io-app-design-system';
import { Canvas } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useIsScreenFocused } from '../../../hooks/useIsScreenFocused';
import { useLayoutSize } from '../../../hooks/useLayoutSize';
import {
  SkiaCardCornerOverlay,
  SkiaCardOverlay,
  SkiaCardPatternOverlay
} from './CardOverlay';
import { CredentialCardConfig } from './config';
import { SkiaGradientBackground } from './GradientBackground';

type Props = Pick<CredentialCardConfig, 'background' | 'color' | 'overlay'>;

export const CardBackground = memo(({ background, color, overlay }: Props) => {
  const { onLayout, size } = useLayoutSize();
  // Skia's Canvas can fail to paint its first frame when it mounts while the
  // screen is mid-transition, leaving the card with only its white base color.
  // Keying the Canvas on the focus state forces a remount when the screen
  // regains focus, guaranteeing a fresh surface that repaints correctly.
  const isFocused = useIsScreenFocused();

  return (
    <View
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, { backgroundColor: IOColors.white }]}
    >
      <Canvas
        key={isFocused ? 'focused' : 'unfocused'}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <SkiaGradientBackground bg={background} {...size} />
        {overlay?.showCornerOverlay && (
          <SkiaCardCornerOverlay color={color} {...size} />
        )}
        {overlay?.pattern && (
          <SkiaCardPatternOverlay src={overlay.pattern} {...size} />
        )}
        {overlay?.card && <SkiaCardOverlay src={overlay.card} {...size} />}
      </Canvas>
    </View>
  );
});
