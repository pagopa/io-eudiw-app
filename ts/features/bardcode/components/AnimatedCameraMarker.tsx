import React from "react";
import { StyleSheet, View } from "react-native";
import { default as Animated, FadeIn } from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { useSineWaveAnimation } from "../../../components/ui/utils/hooks/useSineWaveAnimation";

const ANIMATION_DURATION = 1500;

type Props = {
  size?: number;
  cornerSize?: number;
  isAnimated?: boolean;
};

const defaultMarkerSize = 230;
const defaultCornerSize = 44;

const AnimatedCameraMarker = ({
  size = defaultMarkerSize,
  cornerSize = defaultCornerSize,
  isAnimated = true
}: Props) => {
  const lineSpan = size / 2 - cornerSize - 8;

  const { animatedStyle: animatedLineStyle } = useSineWaveAnimation({
    enabled: isAnimated,
    span: lineSpan,
    duration: ANIMATION_DURATION,
    axis: "y"
  });

  const drawMarkerCorner = (rotation: number, currentSize: number) => {
    return (
      <Svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 44 44"
        fill="none"
        transform={[{ rotate: `${rotation}deg` }]}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28 4C14.745 4 4 14.745 4 28v14a2 2 0 11-4 0V28C0 12.536 12.536 0 28 0h14a2 2 0 110 4H28z"
          fill="#fff"
        />
      </Svg>
    );
  };

  const drawCameraCorner = (currentSize: number) => {
    return (
      <Svg
        width={currentSize - 10}
        height={currentSize}
        viewBox="0 0 44 44"
        fill="none"
      >
        <Path
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          d="M2 2L221 2.00002"
        />
      </Svg>
    );
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn}>
      <View style={[styles.marker, { width: size, height: size }]}>
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
          {drawCameraCorner(size)}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "105%",
    justifyContent: "center"
  },
  marker: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  corners: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    position: "absolute"
  },
  cornersSide: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export { AnimatedCameraMarker };
