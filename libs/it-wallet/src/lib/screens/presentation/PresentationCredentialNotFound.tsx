import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import ItwCredentialNotFound from '../../components/ItwCredentialNotFound';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch } from '../../store';
import { resetPresentation } from '../../store/presentation';

export type PresentationCredentialNotFoundParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_NOT_FOUND'
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
  const { credentialType } = route.params;

  const onDismiss = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <ItwCredentialNotFound
      credentialType={credentialType}
      continueButtonLabel={t('buttons.continue')}
      cancelButtonLabel={t('buttons.cancel')}
      onDismiss={onDismiss}
    />
  );
};

export default PresentationCredentialNotFound;
