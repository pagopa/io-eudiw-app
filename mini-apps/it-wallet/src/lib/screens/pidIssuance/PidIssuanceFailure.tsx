import {
  OperationResultScreenContent,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetInstanceCreation,
  resetPidIssuance
} from '../../store/pidIssuance';
import {
  selectPidIssuanceError,
  selectPidIssuanceErrorType
} from '../../store/selectors/pidIssuance';

/**
 * Filure screen of the pid issuance flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PidIssuanceFailure = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectPidIssuanceError);
  const errorType = useAppSelector(selectPidIssuanceErrorType);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);

  useDebugInfo({ error, errorType });

  const onPress = () => {
    dispatch(resetInstanceCreation());
    dispatch(resetPidIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t('common:buttons.close'),
        label: t('common:buttons.close'),
        onPress
      }}
      pictogram="umbrella"
      subtitle={t('wallet:pidIssuance.failure.subtitle')}
      title={t('wallet:pidIssuance.failure.title')}
    />
  );
};

export default PidIssuanceFailure;
