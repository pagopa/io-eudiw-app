import { Banner, IOToast } from '@pagopa/io-app-design-system';
import I18n from 'i18next';

import { useAppDispatch } from '../../store';
import { disablePidInfoBanner } from '../../store/credentials';

const ItwDiscoveryInfoBanner = () => {
  const dispatch = useAppDispatch();

  const handleOnPress = () => {
    IOToast.info(I18n.t('featureUnavailable.title', { ns: 'common' }));
  };

  const handleOnClose = () => {
    dispatch(disablePidInfoBanner());
  };

  return (
    <Banner
      action={I18n.t('buttons.findOutMore', { ns: 'common' })}
      color="neutral"
      content={I18n.t('presentation.itWalletId.banner.content', {
        ns: 'wallet'
      })}
      labelClose={I18n.t('buttons.close', { ns: 'common' })}
      onClose={handleOnClose}
      onPress={handleOnPress}
      pictogramName="help"
      testID="itwDiscoveryInfoBannerTestID"
      title={I18n.t('presentation.itWalletId.banner.title', { ns: 'wallet' })}
    />
  );
};

export { ItwDiscoveryInfoBanner };
