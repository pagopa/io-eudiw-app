import {ViewStyle} from 'react-native';
import Animated, {
  AnimateStyle,
  LayoutAnimation,
  WithSpringConfig,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

type Props = {
  visible?: boolean;
  springConfig?: WithSpringConfig;
  delayOut?: number;
  delayIn?: number;
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Cmponent which provides a scaling animation for its children.
 * The component scales in when it becomes visible and scales out when it becomes invisible.
 * @param visible - Whether the component is visible or not.
 * @param springConfig - Configuration for the spring animation.
 * @param delayOut - Delay in milliseconds before the scale out animation starts.
 * @param delayIn - Delay in milliseconds before the scale in animation starts.
 * @param children - The content to be animated.
 * @param style - Style for the animated view.
 */
const ScaleInOutAnimation = ({
  visible = true,
  springConfig = {damping: 500, mass: 3, stiffness: 1000},
  delayOut = 0,
  delayIn = 0,
  children,
  style
}: Props) => {
  const enteringAnimation = (): LayoutAnimation => {
    'worklet';
    return {
      initialValues: {
        transform: [{scale: 0}]
      },
      animations: {
        transform: [{scale: withDelay(delayIn, withSpring(1, springConfig))}]
      }
    };
  };

  const exitingAnimation = (): LayoutAnimation => {
    'worklet';
    return {
      initialValues: {
        transform: [{scale: 1}]
      },
      animations: {
        transform: [{scale: withDelay(delayOut, withTiming(0))}]
      }
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={style as AnimateStyle<ViewStyle>}
      entering={enteringAnimation}
      exiting={exitingAnimation}>
      {children}
    </Animated.View>
  );
};

export {ScaleInOutAnimation};
