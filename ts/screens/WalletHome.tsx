import {
  HeaderActionProps,
  HeaderFirstLevel
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { WalletCardsContainer } from '../features/wallet/components/WalletCardsContainer';
import { IOScrollView } from '../components/IOScrollView';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../features/wallet/navigation/routes';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const { t } = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();

  const actions: HeaderFirstLevel['actions'] = useMemo(
    () => [
      {
        icon: 'add',
        onPress: () =>
          navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
            screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
          }),
        accessibilityLabel: t('global:settings.title')
      } satisfies HeaderActionProps,
      {
        icon: 'coggle',
        onPress: () =>
          navigation.navigate('ROOT_MAIN_NAV', { screen: 'MAIN_SETTINGS' }),
        accessibilityLabel: t('global:settings.title')
      }
    ],
    [navigation, t]
  );

  return (
    <>
      <HeaderFirstLevel
        title={t('global:tabNavigator.wallet')}
        actions={actions}
      />
      <IOScrollView centerContent={true} excludeSafeAreaMargins={true}>
        <WalletCardsContainer />
      </IOScrollView>
    </>
  );
};

export default WalletHome;
