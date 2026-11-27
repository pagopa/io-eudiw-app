import { useTranslation } from 'react-i18next';

import { HsmPasswordScreenContent } from '../../components/HsmPasswordScreenContent';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  setCredentialIssuanceHsmPassword
} from '../../store/credentialIssuance';

/**
 * Screen which asks the user for the IT-Wallet password, which authorizes the presentation of the PID
 * to the credential issuer. The issuance listener asks for it again while it is wrong.
 */
const CredentialIssuanceHsmPassword = () => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const { loading, step } = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('alert.body'),
      cancelLabel: t('alert.cancel'),
      confirmLabel: t('alert.confirm'),
      title: t('alert.title')
    },
    handleDismiss: () => {
      dispatch(resetCredentialIssuance());
      navigateToWallet();
    }
  });

  return (
    <HsmPasswordScreenContent
      isAuthorizing={loading && step !== 'hsmPasswordRequired'}
      onBack={dismissalDialog.show}
      onForgotPassword={() => dispatch(resetCredentialIssuance())}
      onSubmit={password =>
        dispatch(setCredentialIssuanceHsmPassword({ password }))
      }
    />
  );
};

export default CredentialIssuanceHsmPassword;
