import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
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
  const { t } = useTranslation(['common', 'itWalletHsm']);
  const dispatch = useAppDispatch();
  const errorPre = useAppSelector(selectPreDefinitionStatus);
  const errorPost = useAppSelector(selectPostDefinitionStatus);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  // At the moment they are the same error
  useDebugInfo({ errorPost, errorPre });

  const onPress = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t('itWalletHsm:presentation.failure.button'),
        label: t('itWalletHsm:presentation.failure.button'),
        onPress
      }}
      pictogram="umbrella"
      subtitle={t('itWalletHsm:presentation.failure.subtitle')}
      title={t('itWalletHsm:presentation.failure.title')}
    />
  );
};

export default PresentationFailure;
