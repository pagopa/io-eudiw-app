import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss
} from '@io-eudiw-app/commons';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

const PidIssuanceResult = () => {
  const { t } = useTranslation('hsm');
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
      title={t('pidIssuance.result.title')}
    />
  );
};

export default PidIssuanceResult;
