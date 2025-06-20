import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetProximity,
  selectProximityAcceptedFields,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus
} from '../../store/proximity';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';

const PresentationProximityFailure = () => {
  const {t} = useTranslation('wallet');
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  const proximityStatus = useAppSelector(selectProximityStatus);

  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const verifierRequest = useAppSelector(selectProximityDocumentRequest);
  const acceptedFields = useAppSelector(selectProximityAcceptedFields);

  useDebugInfo({
    verifierRequest,
    acceptedFields,
    proximityStatusEnd: proximityStatus,
    proximityErrorDetailsEnd: proximityErrorDetails
  });

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
