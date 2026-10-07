import {
  OperationResultScreenContent,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { Errors } from '@pagopa/io-react-native-wallet';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthError,
  selectCredentialIssuancePreAuthError
} from '../../store/credentialIssuance';

const CREDENTIAL_INVALID_STATUS_CODE =
  Errors.IssuerResponseErrorCodes.CredentialInvalidStatus;

const isCredentialInvalidStatusError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === CREDENTIAL_INVALID_STATUS_CODE;

const CredentialFailure = () => {
  const { t } = useTranslation(['common', 'itWalletHsm']);
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();
  const postError = useAppSelector(selectCredentialIssuancePostAuthError);
  const preError = useAppSelector(selectCredentialIssuancePreAuthError);
  const isInvalidStatus =
    isCredentialInvalidStatusError(postError) ||
    isCredentialInvalidStatusError(preError);

  useHardwareBackButton(() => true);

  useDebugInfo({ postError, preError });

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  if (isInvalidStatus) {
    return (
      <OperationResultScreenContent
        action={{
          accessibilityLabel: t('common:buttons.close'),
          label: t('common:buttons.close'),
          onPress
        }}
        pictogram="umbrella"
        subtitle={t(
          'itWalletHsm:credentialIssuance.failure.credentialInvalidStatus.subtitle'
        )}
        title={t(
          'itWalletHsm:credentialIssuance.failure.credentialInvalidStatus.title'
        )}
      />
    );
  }

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t('common:buttons.close'),
        label: t('common:buttons.close'),
        onPress
      }}
      pictogram="umbrella"
      subtitle={t('itWalletHsm:credentialIssuance.failure.subtitle')}
      title={t('itWalletHsm:credentialIssuance.failure.title')}
    />
  );
};

export default CredentialFailure;
