import {useTranslation} from 'react-i18next';

import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {resetPidIssuance} from '../../store/pidIssuance';
import {useAppDispatch} from '../../../../store';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Success screen for the PID issuance flow.
 * It currently shows a message and two buttons: one to add the PID to the wallet and one to add it later.
 * They both redirect to the main screen.
 */
const PidIssuanceSuccess = () => {
  const {t} = useTranslation(['wallet']);
  const dispatch = useAppDispatch();
  const {navigateToWallet} = useNavigateToWalletWithReset();

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={t('wallet:pidIssuance.success.title')}
      subtitle={t('wallet:pidIssuance.success.subtitle')}
      action={{
        accessibilityLabel: t('wallet:pidIssuance.success.buttons.add'),
        label: t('wallet:pidIssuance.success.buttons.add'),
        onPress: () => {
          dispatch(resetPidIssuance());
          navigateToWallet();
        }
      }}
      secondaryAction={{
        label: t('wallet:pidIssuance.success.buttons.later'),
        accessibilityLabel: t('wallet:pidIssuance.success.buttons.later'),
        onPress: () => {
          dispatch(resetPidIssuance());
          navigateToWallet();
        }
      }}
    />
  );
};

export default PidIssuanceSuccess;
