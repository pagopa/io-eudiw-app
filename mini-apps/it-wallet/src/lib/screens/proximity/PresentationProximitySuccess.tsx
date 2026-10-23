import { OperationResultScreenContent } from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetProximity,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus
} from '../../store/proximity';

const PresentationProximitySuccess = () => {
  const { t } = useTranslation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const dispatch = useAppDispatch();

  const proximityStatus = useAppSelector(selectProximityStatus);

  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const verifierRequest = useAppSelector(selectProximityDocumentRequest);

  useDebugInfo({
    proximityErrorDetailsEnd: proximityErrorDetails,
    proximityStatusEnd: proximityStatus,
    verifierRequest
  });

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t('proximity.success.button', { ns: 'wallet' }),
        label: t('proximity.success.button', { ns: 'wallet' }),
        onPress: () => {
          navigateToWallet();
          dispatch(resetProximity());
        }
      }}
      pictogram="success"
      subtitle={t('proximity.success.subtitle', { ns: 'wallet' })}
      title={t('proximity.success.title', { ns: 'wallet' })}
    />
  );
};

export default PresentationProximitySuccess;
