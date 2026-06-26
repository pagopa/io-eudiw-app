import { Banner, IOToast } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { useAppDispatch } from '../../store';
import { preferencesDisablePidInfoBanner } from '@io-eudiw-app/preferences';

const ItwDiscoveryInfoBanner = () => {
  const dispatch = useAppDispatch();

  const handleOnPress = () => {
    IOToast.info(I18n.t('featureUnavailable.title', { ns: 'common' }));
  };

  const handleOnClose = () => {
    dispatch(preferencesDisablePidInfoBanner());
  };

  return (
    <Banner
      testID="itwDiscoveryInfoBannerTestID"
      color="neutral"
      pictogramName="help"
      title={I18n.t('presentation.itWalletId.banner.title', { ns: 'wallet' })}
      content={I18n.t('presentation.itWalletId.banner.content', {
        ns: 'wallet'
      })}
      action={I18n.t('buttons.findOutMore', { ns: 'common' })}
      onPress={handleOnPress}
      labelClose={I18n.t('buttons.close', { ns: 'common' })}
      onClose={handleOnClose}
    />
  );
};

export { ItwDiscoveryInfoBanner };
