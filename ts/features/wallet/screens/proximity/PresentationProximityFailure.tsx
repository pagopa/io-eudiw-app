import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';
import {useAppDispatch} from '../../../../store';
import {resetProximity} from '../../store/proximity';

const PresentationProximityFailure = () => {
  const {t} = useTranslation('wallet');
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={t('proximity.failure.title')}
      subtitle={t('proximity.failure.subtitleFatal')}
      action={{
        accessibilityLabel: t('proximity.failure.understand'),
        label: t('proximity.failure.understand'),
        onPress: () => {
          navigateToWallet();
          dispatch(resetProximity());
        }
      }}
    />
  );
};

export default PresentationProximityFailure;
