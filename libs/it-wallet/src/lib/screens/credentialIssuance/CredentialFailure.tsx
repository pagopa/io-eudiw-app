import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  openWebUrl,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthError,
  selectCredentialIssuancePreAuthError,
  selectRequestedCredentialType
} from '../../store/credentialIssuance';
import { useAppDispatch, useAppSelector } from '../../store';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { Errors } from '@pagopa/io-react-native-wallet';

const CREDENTIAL_INVALID_STATUS_CODE =
  Errors.IssuerResponseErrorCodes.CredentialInvalidStatus;

const isCredentialInvalidStatusError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === CREDENTIAL_INVALID_STATUS_CODE;

const CredentialFailure = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();
  const postError = useAppSelector(selectCredentialIssuancePostAuthError);
  const preError = useAppSelector(selectCredentialIssuancePreAuthError);
  const requestedCredentialType = useAppSelector(selectRequestedCredentialType);

  const isInvalidStatus =
    isCredentialInvalidStatusError(postError) ||
    isCredentialInvalidStatusError(preError);

  const invalidStatusFailure =
    isInvalidStatus && requestedCredentialType
      ? getCredentialCapabilities(requestedCredentialType).invalidStatusFailure
      : undefined;

  useHardwareBackButton(() => true);

  useDebugInfo({ postError, preError });

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  if (invalidStatusFailure) {
    return (
      <OperationResultScreenContent
        pictogram={invalidStatusFailure.pictogram}
        title={t(invalidStatusFailure.titleI18nKey)}
        subtitle={t(invalidStatusFailure.subtitleI18nKey)}
        action={{
          accessibilityLabel: t(invalidStatusFailure.actionI18nKey),
          label: t(invalidStatusFailure.actionI18nKey),
          onPress: () => {
            openWebUrl(invalidStatusFailure.actionUrl, () => null);
            dispatch(resetCredentialIssuance());
            navigateToWallet();
          }
        }}
        secondaryAction={{
          accessibilityLabel: t('common:buttons.close'),
          label: t('common:buttons.close'),
          onPress
        }}
      />
    );
  }

  if (isInvalidStatus) {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={t(
          'wallet:credentialIssuance.failure.credentialInvalidStatus.title'
        )}
        subtitle={t(
          'wallet:credentialIssuance.failure.credentialInvalidStatus.subtitle'
        )}
        action={{
          accessibilityLabel: t('common:buttons.close'),
          label: t('common:buttons.close'),
          onPress
        }}
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={t('wallet:credentialIssuance.failure.title')}
      subtitle={t('wallet:credentialIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('common:buttons.close'),
        label: t('common:buttons.close'),
        onPress
      }}
    />
  );
};

export default CredentialFailure;
