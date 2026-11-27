import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useStartIdentityRecovery } from '../../hooks/useStartIdentityRecovery';
import { useAppDispatch } from '../../store';
import { resetPresentation } from '../../store/presentation';

/**
 * Screen shown when the IT-Wallet password has been entered wrong too many times, which locks the PID.
 * The user must confirm the identity again to obtain a new PID and a new password.
 */
const PresentationRemoteKeyLocked = () => {
  const { t } = useTranslation('hsm');
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const { startIdentityRecovery } = useStartIdentityRecovery();

  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  return (
    <OperationResultScreenContent
      action={{
        label: t('presentation.remoteKeyLocked.primaryAction'),
        onPress: () => {
          dispatch(resetPresentation());
          startIdentityRecovery();
        }
      }}
      pictogram="attention"
      secondaryAction={{
        label: t('presentation.remoteKeyLocked.secondaryAction'),
        onPress: () => {
          dispatch(resetPresentation());
          navigateToWallet();
        }
      }}
      subtitle={t('presentation.remoteKeyLocked.subtitle')}
      title={t('presentation.remoteKeyLocked.title')}
    />
  );
};

export default PresentationRemoteKeyLocked;
