import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss
} from '@io-eudiw-app/commons';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

const PidIssuanceResult = () => {
  const { t } = useTranslation('wallet');
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useDisableGestureNavigation();
  useHardwareBackButtonToDismiss(navigateToWallet);

  return (
    <OperationResultScreenContent
      action={{
        label: t('pidIssuance.result.primaryAction'),
        onPress: navigateToWallet
      }}
      pictogram="success"
      subtitle={t('pidIssuance.result.subtitle')}
      title={t('pidIssuance.result.title')}
    />
  );
};

export default PidIssuanceResult;
