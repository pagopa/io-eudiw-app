import {
  IOColors,
  LoadingSpinner,
  WithTestID
} from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { useInteractiveElementDefaultColor } from '../hooks/theme';

type LoadingIndicatorProps = WithTestID<
  Exclude<
    React.ComponentProps<typeof LoadingSpinner>,
    'size' | 'color' | 'duration'
  >
>;

/**
 * Loading indicator component which renders a loading spinner with 48 size.
 */
export const LoadingIndicator = ({
  accessibilityHint = t('accessibility.activityIndicator.hint', {
    ns: 'global'
  }),
  accessibilityLabel = t('accessibility.activityIndicator.label', {
    ns: 'global'
  }),
  testID = 'LoadingIndicator'
}: LoadingIndicatorProps) => {
  const blueColor = useInteractiveElementDefaultColor();

  return (
    <LoadingSpinner
      size={48}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      color={IOColors[blueColor]}
      testID={testID}
    />
  );
};
