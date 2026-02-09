import { Banner } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { View } from 'react-native';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { useAppSelector } from '../../../store';
import WALLET_ROUTES from '../navigation/routes';
import { itwShouldRenderWalletReadyBannerSelector } from '../store/selectors/wallet';
export const ItwWalletReadyBanner = () => {
  const navigation = useNavigation();
  const shouldRender = useAppSelector(itwShouldRenderWalletReadyBannerSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
    });
  };

  return (
    <View style={{ marginHorizontal: -8 }}>
      <Banner
        title={undefined}
        content={t('issuance.emptyWallet.readyBanner.content', {
          ns: 'wallet'
        })}
        action={t('issuance.emptyWallet.readyBanner.action', {
          ns: 'wallet'
        })}
        color="turquoise"
        onPress={handleOnPress}
        testID="itwWalletReadyBannerTestID"
        pictogramName="itWallet"
      />
    </View>
  );
};
