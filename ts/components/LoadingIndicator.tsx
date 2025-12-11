import {
  IOColors,
  LoadingSpinner,
  WithTestID
} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {useInteractiveElementDefaultColor} from '../hooks/theme';

export type LoadingIndicator = WithTestID<
  Exclude<
    React.ComponentProps<typeof LoadingSpinner>,
    'size' | 'color' | 'duration'
  >
>;

/**
 * Loading indicator component which renders a loading spinner with 48 size.
 */
export const LoadingIndicator = ({
  accessibilityHint = i18next.t('accessibility.activityIndicator.hint', {
    ns: 'global'
  }),
  accessibilityLabel = i18next.t('accessibility.activityIndicator.label', {
    ns: 'global'
  }),
  testID = 'LoadingIndicator'
}: LoadingIndicator) => {
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
