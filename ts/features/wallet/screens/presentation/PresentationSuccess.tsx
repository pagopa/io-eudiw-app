import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {resetPidIssuance} from '../../store/pidIssuance';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {selectPostDefinitionResult} from '../../store/presentation';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Success screen for the PID issuance flow.
 * It currently shows a message and two buttons: one to add the PID to the wallet and one to add it later.
 * They both redirect to the main screen.
 */
const PresentationSuccess = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectPostDefinitionResult);
  const {navigateToWallet} = useNavigateToWalletWithReset();

  useDebugInfo({result});

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={t('wallet:presentation.success.title')}
      subtitle={t('wallet:presentation.success.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.done'),
        label: t('global:buttons.done'),
        onPress: () => {
          dispatch(resetPidIssuance());
          navigateToWallet();
        }
      }}
    />
  );
};

export default PresentationSuccess;
