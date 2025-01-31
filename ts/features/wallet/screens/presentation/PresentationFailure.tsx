import {useTranslation} from 'react-i18next';
import React from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {selectPidIssuanceError} from '../../store/pidIssuance';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {resetPresentation} from '../../store/presentation';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Filure screen of the presentation flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PresentationFailure = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectPidIssuanceError);
  const {navigateToWallet} = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useDebugInfo({error});

  const onPress = () => {
    dispatch(resetPresentation());
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

export default PresentationFailure;
