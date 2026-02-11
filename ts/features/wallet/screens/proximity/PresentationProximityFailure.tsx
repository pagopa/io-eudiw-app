import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { OperationResultScreenContent } from '../../../../components/screens/OperationResultScreenContent';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
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
      pictogram="umbrella"
      title={t('proximity.failure.title')}
      subtitle={
        route.params.fatal
          ? t('proximity.failure.subtitleFatal')
          : t('proximity.failure.subtitle')
      }
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
