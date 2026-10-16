import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import CameraMarkerCorner from '../../assets/img/camera/camera-marker-corner.svg';
import CameraMarkerLine from '../../assets/img/camera/camera-marker-line.svg';
import { useSineWaveAnimation } from '../hooks/useSineWaveAnimation';
const ANIMATION_DURATION = 1500;

type Props = {
  cornerSize?: number;
  isAnimated?: boolean;
  size?: number;
};

const defaultMarkerSize = 230;
const defaultCornerSize = 44;

/**
 * Camera marker with animated line which moves up and down and is displayed in the center of the screen while scanning a QR code.
 * @param size? - The size of the marker. Default is 230.
 * @param cornerSize? - The size of the corner. Default is 44.
 * @param isAnimated - If true, the line will be animated. Default is true.
 */
const AnimatedCameraMarker = ({
  cornerSize = defaultCornerSize,
  isAnimated = true,
  size = defaultMarkerSize
}: Props) => {
  const lineSpan = size / 2 - cornerSize - 8;

  const { animatedStyle: animatedLineStyle } = useSineWaveAnimation({
    axis: 'y',
    duration: ANIMATION_DURATION,
    enabled: isAnimated,
    span: lineSpan
  });

  const drawMarkerCorner = (rotation: number, markerSize: number) => (
    <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <CameraMarkerCorner height={markerSize} width={markerSize} />
    </View>
  );

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={[styles.marker, { height: size, width: size }]}>
        <View style={styles.corners}>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(0, cornerSize)}
            {drawMarkerCorner(90, cornerSize)}
          </View>
          <View style={styles.cornersSide}>
            {drawMarkerCorner(-90, cornerSize)}
            {drawMarkerCorner(180, cornerSize)}
          </View>
        </View>
        <Animated.View style={animatedLineStyle}>
          <CameraMarkerLine height={size} width={size - 10} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '105%',
    justifyContent: 'center',
    width: '100%'
  },
  corners: {
    height: '100%',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%'
  },
  cornersSide: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }
});

export { AnimatedCameraMarker };
