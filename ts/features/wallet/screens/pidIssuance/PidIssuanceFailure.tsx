import {useTranslation} from 'react-i18next';
import React from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {
  resetInstanceCreation,
  resetPidIssuance,
  selectPidIssuanceError
} from '../../store/pidIssuance';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Filure screen of the pid issuance flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PidIssuanceFailure = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectPidIssuanceError);
  const {navigateToWallet} = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);

  useDebugInfo({error});

  const onPress = () => {
    dispatch(resetInstanceCreation());
    dispatch(resetPidIssuance());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={t('wallet:pidIssuance.failure.title')}
      subtitle={t('wallet:pidIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress
      }}
    />
  );
};

export default PidIssuanceFailure;
