import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { ItwHighlightBanner } from './ItwHighlightBanner';

export const ItwUpgradeBanner = () => {
  const navigation = useNavigation();

  const handleOnPress = () => {
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: 'PID_ISSUANCE_INSTANCE_CREATION'
    });
  };

  return (
    <ItwHighlightBanner
      testID="itwUpgradeBannerTestID"
      title={I18n.t(`activationBanner.title`, { ns: 'wallet' })}
      description={I18n.t(`activationBanner.description`, { ns: 'wallet' })}
      action={I18n.t(`activationBanner.action`, { ns: 'wallet' })}
      onPress={handleOnPress}
    />
  );
};
