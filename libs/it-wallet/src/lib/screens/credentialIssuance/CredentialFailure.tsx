import {
  openWebUrl,
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
  selectCredentialIssuancePreAuthError,
  selectRequestedCredentialType
} from '../../store/credentialIssuance';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';

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
        action={{
          accessibilityLabel: t(invalidStatusFailure.actionI18nKey),
          label: t(invalidStatusFailure.actionI18nKey),
          onPress: () => {
            openWebUrl(invalidStatusFailure.actionUrl, () => null);
            dispatch(resetCredentialIssuance());
            navigateToWallet();
          }
        }}
        pictogram={invalidStatusFailure.pictogram}
        secondaryAction={{
          accessibilityLabel: t('common:buttons.close'),
          label: t('common:buttons.close'),
          onPress
        }}
        subtitle={t(invalidStatusFailure.subtitleI18nKey)}
        title={t(invalidStatusFailure.titleI18nKey)}
      />
    );
  }

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
          'wallet:credentialIssuance.failure.credentialInvalidStatus.subtitle'
        )}
        title={t(
          'wallet:credentialIssuance.failure.credentialInvalidStatus.title'
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
      subtitle={t('wallet:credentialIssuance.failure.subtitle')}
      title={t('wallet:credentialIssuance.failure.title')}
    />
  );
};

export default CredentialFailure;
