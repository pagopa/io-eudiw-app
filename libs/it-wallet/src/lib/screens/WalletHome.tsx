import {
  HeaderActionProps,
  HeaderFirstLevel
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { WalletCardsContainer } from '../components/WalletCardsContainer';
import { IOScrollView } from '@io-eudiw-app/commons';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const actions: HeaderFirstLevel['actions'] = useMemo(
    () => [
      {
        icon: 'add',
        onPress: () =>
          navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
            screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
          }),
        accessibilityLabel: t('settings.title', { ns: 'wallet' })
      } satisfies HeaderActionProps,
      {
        icon: 'coggle',
        onPress: () => navigation.navigate('MAIN_SETTINGS'),
        accessibilityLabel: t('settings.title', { ns: 'wallet' })
      }
    ],
    [navigation, t]
  );

  return (
    <>
      <HeaderFirstLevel
        title={t('tabNavigator.wallet', { ns: 'wallet' })}
        actions={actions}
      />
      <IOScrollView centerContent={true} excludeSafeAreaMargins={true}>
        <WalletCardsContainer />
      </IOScrollView>
    </>
  );
};

export default WalletHome;
