import {
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import ItwCredentialNotFound from '../../components/ItwCredentialNotFound';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { PresentationNavigatorParamsList } from '../../navigation/presentation/PresentationNavigator';
import PRESENTATION_ROUTES from '../../navigation/presentation/routes';
import { useAppDispatch } from '../../store';
import { resetPresentation } from '../../store/presentation';

export type PresentationCredentialNotFoundParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  PresentationNavigatorParamsList,
  typeof PRESENTATION_ROUTES.CREDENTIAL_NOT_FOUND
>;

/**
 * Presentation screen shown when a credential required by the DCQL query is
 * not present in the wallet. Wraps `ItwCredentialNotFound` and owns the
 * presentation state reset and navigation reset; the credential type is
 * received via navigation params so the rendered content does not depend on
 * the presentation slice and is not affected by `resetPresentation`.
 */
const PresentationCredentialNotFound = ({ route }: Props) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();
  const { credentialType } = route.params;

  const onDismiss = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <ItwCredentialNotFound
      cancelButtonLabel={t('buttons.cancel')}
      continueButtonLabel={t('buttons.continue')}
      credentialType={credentialType}
      onDismiss={onDismiss}
    />
  );
};

export default PresentationCredentialNotFound;
