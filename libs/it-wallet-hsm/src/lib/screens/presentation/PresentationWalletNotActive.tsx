import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { useAppDispatch } from '../../store';
import { setCredentialIssuancePreAuthRequest } from '../../store/credentialIssuance';
import { resetPresentation } from '../../store/presentation';
import { wellKnownCredentialConfigurationIDs } from '../../utils/credentials';

/**
 * Navigation params for the wallet-not-active screen.
 */
export type PresentationWalletNotActiveParams = undefined;

/**
 * Error screen shown when an operation requires an active wallet but the
 * wallet has not been activated yet (lifecycle is LIFECYCLE_OPERATIONAL). It
 * prompts the user to start the wallet activation flow or go back to the wallet
 * home screen.
 *
 * Used by the presentation flow when an inactive wallet needs activation.
 */
const PresentationWalletNotActive = () => {
  const { t } = useTranslation('itWalletHsm');
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const onActivate = () => {
    dispatch(resetPresentation());
    dispatch(
      setCredentialIssuancePreAuthRequest({
        credential: wellKnownCredentialConfigurationIDs.PID
      })
    );
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
    });
  };

  const onDismiss = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      action={{
        label: t('notActive.confirm'),
        onPress: onActivate
      }}
      pictogram="itWallet"
      secondaryAction={{
        label: t('notActive.notNow'),
        onPress: onDismiss
      }}
      subtitle={t('notActive.body')}
      title={t('notActive.title')}
    />
  );
};

export default PresentationWalletNotActive;
