import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { Body } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';

/**
 * Screen shown while the presentations are sent to the Relying Party.
 * The PresentationPostDefinition screen, still mounted below, navigates to the result screen.
 */
const PresentationSending = () => {
  const { t } = useTranslation('hsm');

  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  return (
    <LoadingScreenContent contentTitle={t('presentation.sending.title')}>
      <Body style={{ textAlign: 'center' }}>
        {t('presentation.sending.subtitle')}
      </Body>
    </LoadingScreenContent>
  );
};

export default PresentationSending;
