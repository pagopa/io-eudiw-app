import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import {
  resetInstanceCreation,
  resetPidIssuance
} from '../../store/pidIssuance';
import { selectPidIssuanceError } from '../../store/selectors/pidIssuance';
import { useAppDispatch, useAppSelector } from '../../store';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Filure screen of the pid issuance flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PidIssuanceFailure = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectPidIssuanceError);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);

  useDebugInfo({ error });

  const onPress = () => {
    dispatch(resetInstanceCreation());
    dispatch(resetPidIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={t('wallet:pidIssuance.failure.title')}
      subtitle={t('wallet:pidIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('common:buttons.close'),
        label: t('common:buttons.close'),
        onPress
      }}
    />
  );
};

export default PidIssuanceFailure;
