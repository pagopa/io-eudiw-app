import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useHardwareBackButton,
} from '@io-eudiw-app/commons';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthError,
  selectCredentialIssuancePreAuthError,
} from '../../store/credentialIssuance';
import { useAppDispatch, useAppSelector } from '../../store';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Filure screen of the credential issuance flow.
 * Currently it only shows a message and a button to go back to the main screen, along with the debug information.
 */
const CredentialFailure = () => {
  const { t } = useTranslation(['global', 'wallet']);
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();
  const postError = useAppSelector(selectCredentialIssuancePostAuthError);
  const preError = useAppSelector(selectCredentialIssuancePreAuthError);

  useHardwareBackButton(() => true);

  useDebugInfo({ postError, preError });

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={t('wallet:credentialIssuance.failure.title')}
      subtitle={t('wallet:credentialIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress,
      }}
    />
  );
};

export default CredentialFailure;
