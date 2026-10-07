import { IOScrollView } from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import {
  HeaderActionProps,
  HeaderFirstLevel,
  useIOToast
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WalletCardsContainer } from '../components/WalletCardsContainer';
import { useProximityEngagement } from '../hooks/useProximityEngagement';
import { getWalletInstanceAttestationThunk } from '../middleware/attestation';
import { createInstanceThunk } from '../middleware/instance';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectWalletInstanceAttestationRequestStatus,
  shouldRequestWalletInstanceAttestationSelector
} from '../store/attestation';
import { hasPresentableCredentialsSelector } from '../store/credentials';
import { selectInstanceCreationStatus } from '../store/instance';
import { lifecycleIsOperationalSelector } from '../store/lifecycle';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const { t } = useTranslation(['common', 'itWalletHsm']);
  const navigation = useNavigation();
  const toast = useIOToast();
  const dispatch = useAppDispatch();
  const { startQrVerification } = useProximityEngagement();
  const [isActivatingWallet, setIsActivatingWallet] = useState(false);
  const hasPresentableCredentials = useAppSelector(
    hasPresentableCredentialsSelector
  );
  const isWalletOperational = useAppSelector(lifecycleIsOperationalSelector);
  const shouldRequestAttestation = useAppSelector(
    shouldRequestWalletInstanceAttestationSelector
  );
  const instanceCreationStatus = useAppSelector(selectInstanceCreationStatus);
  const attestationRequestStatus = useAppSelector(
    selectWalletInstanceAttestationRequestStatus
  );

  useDebugInfo({ attestationRequestStatus, instanceCreationStatus });

  const activateWallet = useCallback(async () => {
    setIsActivatingWallet(true);
    try {
      await dispatch(createInstanceThunk()).unwrap();
      await dispatch(getWalletInstanceAttestationThunk()).unwrap();
      toast.success(t('generics.success', { ns: 'common' }));
    } catch {
      toast.error(t('errors.generic', { ns: 'common' }));
    } finally {
      setIsActivatingWallet(false);
    }
  }, [dispatch, t, toast]);

  const actions: HeaderFirstLevel['actions'] = useMemo(
    () => [
      {
        accessibilityLabel: t('settings.title', { ns: 'itWalletHsm' }),
        icon: 'add',
        onPress: () =>
          navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
            screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
          })
      } satisfies HeaderActionProps,
      {
        accessibilityLabel: t('settings.title', { ns: 'itWalletHsm' }),
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
        title={t('tabNavigator.wallet', { ns: 'itWalletHsm' })}
      />
      <IOScrollView
        actions={
          hasPresentableCredentials
            ? {
                primary: {
                  label: t('proximity.home.cta', { ns: 'itWalletHsm' }),
                  onPress: () => void startQrVerification()
                },
                type: 'SingleButton'
              }
            : isWalletOperational && shouldRequestAttestation
              ? {
                  primary: {
                    label: t('walletActivation.cta', { ns: 'itWalletHsm' }),
                    loading: isActivatingWallet,
                    onPress: () => void activateWallet()
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
