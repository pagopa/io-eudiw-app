import { IOColors } from '@pagopa/io-app-design-system';
import { Canvas } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CredentialCardConfig } from './config';
import { SkiaGradientBackground } from './GradientBackground';
import {
  SkiaCardCornerOverlay,
  SkiaCardOverlay,
  SkiaCardPatternOverlay
} from './CardOverlay';
import { useLayoutSize } from '../../../hooks/useLayoutSize';

type Props = Pick<CredentialCardConfig, 'background' | 'color' | 'overlay'>;

export const CardBackground = memo(({ background, color, overlay }: Props) => {
  const { size, onLayout } = useLayoutSize();

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={onLayout}
    >
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
