import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';
import {useAppDispatch} from '../../../../store';
import {resetProximity} from '../../store/proximity';

const PresentationProximitySuccess = () => {
  const {t} = useTranslation('wallet');
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={t('proximity.success.title')}
      subtitle={t('proximity.success.subtitle')}
      action={{
        accessibilityLabel: t('proximity.success.button'),
        label: t('proximity.success.button'),
        onPress: () => {
          navigateToWallet();
          dispatch(resetProximity());
        }
      }}
    />
  );
};

export default PresentationProximitySuccess;
