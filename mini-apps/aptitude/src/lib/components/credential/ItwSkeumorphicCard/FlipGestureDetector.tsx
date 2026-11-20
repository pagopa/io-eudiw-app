import { ReactNode } from 'react';
import {
  Directions,
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

const directions = {
  leftright: Directions.LEFT + Directions.RIGHT,
  updown: Directions.UP + Directions.DOWN
};

type FlipsGestureDetectorProps = {
  children: ReactNode;
  direction?: keyof typeof directions;
  disabled?: boolean;
  isFlipped: boolean;
  onPress?: () => void;
  setIsFlipped: (isFlipped: boolean) => void;
};

/**
 * This component wraps the children in a GestureDetector that flips the card when the user flicks left or right.
 */
export const FlipGestureDetector = ({
  children,
  direction = 'leftright',
  disabled = false,
  isFlipped,
  onPress,
  setIsFlipped
}: FlipsGestureDetectorProps) => {
  const tapGesture = Gesture.Tap().onEnd(() => {
    if (onPress) {
      scheduleOnRN(onPress);
    }
  });

  const flipGesture = Gesture.Fling()
    .direction(directions[direction])
    .enabled(!disabled)
    .onEnd(() => scheduleOnRN(setIsFlipped, !isFlipped));

  const composed = Gesture.Exclusive(flipGesture, tapGesture);

  return <GestureDetector gesture={composed}>{children}</GestureDetector>;
};
