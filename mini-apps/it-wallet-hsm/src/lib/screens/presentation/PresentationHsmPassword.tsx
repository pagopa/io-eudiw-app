import { HsmPasswordScreenContent } from '../../components/HsmPasswordScreenContent';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { usePresentationCancelDialog } from '../../hooks/usePresentationCancelDialog';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectPostDefinitionStatus,
  setPostDefinitionCancel,
  setPresentationHsmPassword
} from '../../store/presentation';

/**
 * Screen which asks the user for the IT-Wallet password, which authorizes the presentation of the credentials
 * bound to a Remote WSCD key, such as the PID. The presentation listener asks for it again while it is wrong.
 */
const PresentationHsmPassword = () => {
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const postDefinitionStatus = useAppSelector(selectPostDefinitionStatus);

  const showCancelDialog = usePresentationCancelDialog(() => {
    dispatch(setPostDefinitionCancel());
    navigateToWallet();
  });

  return (
    <HsmPasswordScreenContent
      isAuthorizing={postDefinitionStatus.step === 'authorizing'}
      onBack={showCancelDialog}
      onForgotPassword={() => dispatch(setPostDefinitionCancel())}
      onSubmit={password => dispatch(setPresentationHsmPassword({ password }))}
    />
  );
};

export default PresentationHsmPassword;
