import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useAppDispatch } from '../../store';
import { resetCredentialIssuance } from '../../store/credentialIssuance';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Screen shown when a credential offer (deep link / QR code) refers to a
 * credential that is already present in the wallet.
 * It informs the user that the credential has already been obtained and lets
 * them go back to the Wallet Home.
 */
const CredentialAlreadyObtained = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  useHardwareBackButton(() => true);

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={t('wallet:credentialIssuance.alreadyObtained.title')}
      subtitle={t('wallet:credentialIssuance.alreadyObtained.subtitle')}
      action={{
        accessibilityLabel: t(
          'wallet:credentialIssuance.alreadyObtained.button'
        ),
        label: t('wallet:credentialIssuance.alreadyObtained.button'),
        onPress
      }}
      secondaryAction={{
        accessibilityLabel: t(
          'wallet:credentialIssuance.alreadyObtained.close'
        ),
        label: t('wallet:credentialIssuance.alreadyObtained.close'),
        onPress
      }}
    />
  );
};

export default CredentialAlreadyObtained;
