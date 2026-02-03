import { useTranslation } from 'react-i18next';
import { OperationResultScreenContent } from '../../../../components/screens/OperationResultScreenContent';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  resetProximity,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus
} from '../../store/proximity';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';

const PresentationProximitySuccess = () => {
  const { t } = useTranslation('wallet');
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  const proximityStatus = useAppSelector(selectProximityStatus);

  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const verifierRequest = useAppSelector(selectProximityDocumentRequest);

  useDebugInfo({
    verifierRequest,
    proximityStatusEnd: proximityStatus,
    proximityErrorDetailsEnd: proximityErrorDetails
  });

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
