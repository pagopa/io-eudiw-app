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
import { wellKnownCredential } from '../../utils/credentials';

const CREDENTIAL_INVALID_STATUS_CODE = 'ERR_CREDENTIAL_INVALID_STATUS';
const BONUS_PARI_REQUEST_URL = 'https://dev.bonuselettrodomestici.it/utente';

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

  const isBonusPariNotRequested =
    isInvalidStatus &&
    requestedCredentialType === wellKnownCredential.BONUS_PARI;

  useHardwareBackButton(() => true);

  useDebugInfo({ postError, preError });

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  if (isBonusPariNotRequested) {
    return (
      <OperationResultScreenContent
        pictogram="accessDenied"
        title={t(
          'wallet:credentialIssuance.failure.bonusPariNotRequested.title'
        )}
        subtitle={t(
          'wallet:credentialIssuance.failure.bonusPariNotRequested.subtitle'
        )}
        action={{
          accessibilityLabel: t(
            'wallet:credentialIssuance.failure.bonusPariNotRequested.action'
          ),
          label: t(
            'wallet:credentialIssuance.failure.bonusPariNotRequested.action'
          ),
          onPress: () => openWebUrl(BONUS_PARI_REQUEST_URL, () => null)
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
