import { Banner, IOToast } from '@pagopa/io-app-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

const HOW_AND_WHEN_TO_USE_IO_DOCUMENTS =
  'https://assistenza.ioapp.it/hc/it/articles/31106401885841-Quando-e-come-usare-i-documenti-digitali';

/**
 * Informational banner shown on the proximity engagement screen explaining how
 * the QR Code works. Dismissable for the current session.
 */
export const ItwProximityQrCodeInfoBanner = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return null;
  }

  const handleOnPress = () => {
    Linking.openURL(HOW_AND_WHEN_TO_USE_IO_DOCUMENTS).catch(() =>
      IOToast.error(t('common:errors.generic'))
    );
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
      onClose={() => setHidden(true)}
    />
  );
};
