import { Canvas } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFocusRemountKey } from '../../../hooks/useFocusRemountKey';
import { useLayoutSize } from '../../../hooks/useLayoutSize';
import { ItwBrandedSkiaBorder } from '../../ItwBrandedSkiaBorder';

type Props = {
  cornerRadius: number;
};

/**
 * IT-Wallet branded gradient border drawn on top of a credential card.
 * The stroke is centered on the card edge, so only its inner half is visible.
 */
export const BrandedBorder = memo(({ cornerRadius }: Props) => {
  const { onLayout, size } = useLayoutSize();
  // See CardBackground
  const remountKey = useFocusRemountKey();

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container]}
    >
      <Canvas key={remountKey} style={StyleSheet.absoluteFill}>
        <ItwBrandedSkiaBorder
          cornerRadius={cornerRadius}
          height={size.height}
          thickness={2}
          width={size.width}
        />
      </Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    zIndex: 11
  }
});
