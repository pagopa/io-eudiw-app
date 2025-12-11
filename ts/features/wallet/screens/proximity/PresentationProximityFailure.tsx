import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
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
import {WalletNavigatorParamsList} from '../../navigation/WalletNavigator';

export type PresentationProximityFailureProps = {
  fatal: boolean;
};

type Props = NativeStackScreenProps<
  WalletNavigatorParamsList,
  'PROXIMITY_FAILURE'
>;
const PresentationProximityFailure = ({route}: Props) => {
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
