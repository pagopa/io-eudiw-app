import { ReactNode } from 'react';
import {
  Directions,
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

const directions = {
  updown: Directions.UP + Directions.DOWN,
  leftright: Directions.LEFT + Directions.RIGHT
};

type FlipsGestureDetectorProps = {
  isFlipped: boolean;
  setIsFlipped: (isFlipped: boolean) => void;
  children: ReactNode;
  direction?: keyof typeof directions;
  onPress?: () => void;
};

/**
 * This component wraps the children in a GestureDetector that flips the card when the user flicks left or right.
 */
export const FlipGestureDetector = ({
  isFlipped,
  setIsFlipped,
  children,
  direction = 'leftright',
  onPress
}: FlipsGestureDetectorProps) => {
  const flipGesture = Gesture.Fling()
    .direction(directions[direction])
    .onEnd(() => scheduleOnRN(setIsFlipped, !isFlipped));

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (onPress) {
      scheduleOnRN(onPress);
    }
  });

  const composed = Gesture.Exclusive(flipGesture, tapGesture);

  return <GestureDetector gesture={composed}>{children}</GestureDetector>;
};
