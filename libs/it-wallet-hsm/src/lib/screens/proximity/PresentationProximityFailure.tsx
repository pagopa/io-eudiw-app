import { OperationResultScreenContent } from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetProximity,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus
} from '../../store/proximity';

export type PresentationProximityFailureProps = {
  fatal: boolean;
};

type Props = StackScreenProps<WalletNavigatorParamsList, 'PROXIMITY_FAILURE'>;
const PresentationProximityFailure = ({ route }: Props) => {
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
        accessibilityLabel: t('proximity.failure.understand', {
          ns: 'itWalletHsm'
        }),
        label: t('proximity.failure.understand', { ns: 'itWalletHsm' }),
        onPress: () => {
          navigateToWallet();
          dispatch(resetProximity());
        }
      }}
      pictogram="umbrella"
      subtitle={
        route.params.fatal
          ? t('proximity.failure.subtitleFatal', { ns: 'itWalletHsm' })
          : t('proximity.failure.subtitle', { ns: 'itWalletHsm' })
      }
      title={t('proximity.failure.title', { ns: 'itWalletHsm' })}
    />
  );
};

export default PresentationProximityFailure;
