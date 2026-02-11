import { useTranslation } from 'react-i18next';
import { OperationResultScreenContent } from '../../../../components/screens/OperationResultScreenContent';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  resetPresentation,
  selectPostDefinitionStatus,
  selectPreDefinitionStatus
} from '../../store/presentation';

/**
 * Filure screen of the presentation flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PresentationFailure = () => {
  const { t } = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const errorPre = useAppSelector(selectPreDefinitionStatus);
  const errorPost = useAppSelector(selectPostDefinitionStatus);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  // At the moment they are the same error
  useDebugInfo({ errorPre, errorPost });

  const onPress = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={t('wallet:presentation.failure.title')}
      subtitle={t('wallet:presentation.failure.subtitle')}
      action={{
        accessibilityLabel: t('wallet:presentation.failure.button'),
        label: t('wallet:presentation.failure.button'),
        onPress
      }}
    />
  );
};

export default PresentationFailure;
