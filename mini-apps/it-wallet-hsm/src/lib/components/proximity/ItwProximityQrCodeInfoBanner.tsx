import { Banner } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';

import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { useAppDispatch } from '../../store';
import { disableProximityInfoBanner } from '../../store/credentials';

/**
 * Informational banner shown on the proximity engagement screen explaining how
 * the QR Code works. Dismissable for the current session.
 */
export const ItwProximityQrCodeInfoBanner = () => {
  const { t } = useTranslation(['common', 'hsm']);
  const dispatch = useAppDispatch();
  const toast = useNotAvailableToastGuard();

  const handleOnPress = () => {
    toast();
  };

  return (
    <Banner
      action={t('hsm:proximity.engagement.banner.action')}
      color="neutral"
      content={t('hsm:proximity.engagement.banner.content')}
      labelClose={t('common:buttons.close')}
      onClose={() => dispatch(disableProximityInfoBanner())}
      onPress={handleOnPress}
      pictogramName="help"
      title={t('hsm:proximity.engagement.banner.title')}
    />
  );
};
