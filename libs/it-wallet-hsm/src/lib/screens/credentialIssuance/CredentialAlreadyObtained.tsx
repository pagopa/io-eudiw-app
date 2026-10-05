import {
  OperationResultScreenContent,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch } from '../../store';
import { resetCredentialIssuance } from '../../store/credentialIssuance';

/**
 * Screen shown when a credential offer (deep link / QR code) refers to a
 * credential that is already present in the wallet.
 * It informs the user that the credential has already been obtained and lets
 * them go back to the Wallet Home.
 */
const CredentialAlreadyObtained = () => {
  const { t } = useTranslation(['common', 'itWalletHsm']);
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  useHardwareBackButton(() => true);

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t(
          'itWalletHsm:credentialIssuance.alreadyObtained.button'
        ),
        label: t('itWalletHsm:credentialIssuance.alreadyObtained.button'),
        onPress
      }}
      pictogram="attention"
      secondaryAction={{
        accessibilityLabel: t(
          'itWalletHsm:credentialIssuance.alreadyObtained.close'
        ),
        label: t('itWalletHsm:credentialIssuance.alreadyObtained.close'),
        onPress
      }}
      subtitle={t('itWalletHsm:credentialIssuance.alreadyObtained.subtitle')}
      title={t('itWalletHsm:credentialIssuance.alreadyObtained.title')}
    />
  );
};

export default CredentialAlreadyObtained;
