import { Banner } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store';
import { disableProximityInfoBanner } from '../../store/credentials';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';

/**
 * Informational banner shown on the proximity engagement screen explaining how
 * the QR Code works. Dismissable for the current session.
 */
export const ItwProximityQrCodeInfoBanner = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const toast = useNotAvailableToastGuard();

  const handleOnPress = () => {
    toast();
  };

  return (
    <Banner
      color="neutral"
      pictogramName="help"
      title={t('wallet:proximity.engagement.banner.title')}
      content={t('wallet:proximity.engagement.banner.content')}
      action={t('wallet:proximity.engagement.banner.action')}
      onPress={handleOnPress}
      labelClose={t('common:buttons.close')}
      onClose={() => dispatch(disableProximityInfoBanner())}
    />
  );
};
