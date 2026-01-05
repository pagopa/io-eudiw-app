import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ItwHighlightBanner } from './ItwHighlightBanner';

export const ItwUpgradeBanner = () => {
  const navigation = useNavigation();

  const { t } = useTranslation('wallet');

  const handleOnPress = () => {
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: 'PID_ISSUANCE_INSTANCE_CREATION'
    });
  };

  // TODO Fix translations
  return (
    <ItwHighlightBanner
      testID="itwUpgradeBannerTestID"
      title={t(`activationBanner.title`)}
      description={t(`activationBanner.description`)}
      action={t(`activationBanner.action`)}
      onPress={handleOnPress}
    />
  );
};
