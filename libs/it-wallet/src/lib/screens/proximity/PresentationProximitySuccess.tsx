import { useTranslation } from 'react-i18next';
import { OperationResultScreenContent } from '@io-eudiw-app/commons';
import {
  resetProximity,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus
} from '../../store/proximity';
import { useAppDispatch, useAppSelector } from '../../store';
import {useDebugInfo} from "@io-eudiw-app/debug-info"
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

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
