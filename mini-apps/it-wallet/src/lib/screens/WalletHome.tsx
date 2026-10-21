import { IOScrollView } from '@io-eudiw-app/commons';
import {
  HeaderActionProps,
  HeaderFirstLevel
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { WalletCardsContainer } from '../components/WalletCardsContainer';
import { useProximityEngagement } from '../hooks/useProximityEngagement';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { useAppSelector } from '../store';
import { hasPresentableCredentialsSelector } from '../store/credentials';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { startQrVerification } = useProximityEngagement();
  const hasPresentableCredentials = useAppSelector(
    hasPresentableCredentialsSelector
  );

  const actions: HeaderFirstLevel['actions'] = useMemo(
    () => [
      {
        accessibilityLabel: t('settings.title', { ns: 'wallet' }),
        icon: 'add',
        onPress: () =>
          navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
            screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
          })
      } satisfies HeaderActionProps,
      {
        accessibilityLabel: t('settings.title', { ns: 'wallet' }),
        icon: 'coggle',
        onPress: () => navigation.navigate('MAIN_SETTINGS')
      }
    ],
    [navigation, t]
  );

  return (
    <>
      <HeaderFirstLevel
        actions={actions}
        title={t('tabNavigator.wallet', { ns: 'wallet' })}
      />
      <IOScrollView
        actions={
          hasPresentableCredentials
            ? {
                primary: {
                  icon: 'productITWallet',
                  iconPosition: 'end',
                  label: t('proximity.home.cta', { ns: 'wallet' }),
                  onPress: () => void startQrVerification()
                },
                type: 'SingleButton'
              }
            : undefined
        }
        centerContent={true}
        excludeSafeAreaMargins={true}
      >
        <WalletCardsContainer />
      </IOScrollView>
    </>
  );
};

export default WalletHome;
