import {
  IOColors,
  LoadingSpinner,
  WithTestID
} from '@pagopa/io-app-design-system';

import { useInteractiveElementDefaultColor } from '../hooks/theme';

type LoadingIndicatorProps = WithTestID<
  Exclude<
    React.ComponentProps<typeof LoadingSpinner>,
    'color' | 'duration' | 'size'
  >
>;

/**
 * Loading indicator component which renders a loading spinner with 48 size.
 */
export const LoadingIndicator = ({
  accessibilityHint,
  accessibilityLabel,
  testID = 'LoadingIndicator'
}: LoadingIndicatorProps) => {
  const blueColor = useInteractiveElementDefaultColor();

  return (
    <LoadingSpinner
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      color={IOColors[blueColor]}
      size={48}
      testID={testID}
    />
  );
};
