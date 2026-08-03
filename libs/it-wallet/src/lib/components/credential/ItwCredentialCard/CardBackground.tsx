import { IOColors } from '@pagopa/io-app-design-system';
import { Canvas } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

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

  return (
    <View
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, { backgroundColor: IOColors.white }]}
    >
      <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
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
