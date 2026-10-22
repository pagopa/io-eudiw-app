import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { ProximityNavigatorParamsList } from '../../navigation/proximity/ProximityNavigator';
import PROXIMITY_ROUTES from '../../navigation/proximity/routes';
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

type Props = StackScreenProps<
  ProximityNavigatorParamsList,
  typeof PROXIMITY_ROUTES.FAILURE
>;
const PresentationProximityFailure = ({ route }: Props) => {
  const { t } = useTranslation();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();
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
        accessibilityLabel: t('proximity.failure.understand', { ns: 'wallet' }),
        label: t('proximity.failure.understand', { ns: 'wallet' }),
        onPress: () => {
          navigateToWallet();
          dispatch(resetProximity());
        }
      }}
      pictogram="umbrella"
      subtitle={
        route.params.fatal
          ? t('proximity.failure.subtitleFatal', { ns: 'wallet' })
          : t('proximity.failure.subtitle', { ns: 'wallet' })
      }
      title={t('proximity.failure.title', { ns: 'wallet' })}
    />
  );
};

export default PresentationProximityFailure;
