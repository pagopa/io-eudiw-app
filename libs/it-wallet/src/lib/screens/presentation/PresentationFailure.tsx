import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import {
  resetPresentation,
  selectPostDefinitionStatus,
  selectPreDefinitionStatus
} from '../../store/presentation';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Filure screen of the presentation flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PresentationFailure = () => {
  const { t } = useTranslation(['common', 'wallet']);
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
