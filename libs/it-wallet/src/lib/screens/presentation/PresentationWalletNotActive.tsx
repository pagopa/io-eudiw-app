import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useAppDispatch } from '../../store';
import { resetPresentation } from '../../store/presentation';
import {
  PendingCredential,
  setPendingCredential
} from '../../store/pidIssuance';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import WALLET_ROUTES from '../../navigation/wallet/routes';

/**
 * Navigation params for the wallet-not-active screen.
 * `pendingCredential` is provided by the credential issuance flow (e.g. a
 * credential offer): it is stored as pending when the user starts the wallet
 * activation so the issuance resumes automatically once the PID is available.
 */
export type PresentationWalletNotActiveParams =
  | {
      pendingCredential?: NonNullable<PendingCredential>;
    }
  | undefined;

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_WALLET_NOT_ACTIVE'
>;

/**
 * Error screen shown when an operation requires an active wallet but the
 * wallet has not been activated yet (lifecycle is LIFECYCLE_OPERATIONAL). It
 * prompts the user to start the wallet activation flow or go back to the wallet
 * home screen.
 *
 * Used both by the presentation flow and by the credential issuance flow. In
 * the latter case a `pendingCredential` is passed via params: it is stored as
 * pending on activation so the credential can be obtained once the PID has been
 * issued.
 */
const PresentationWalletNotActive = ({ route }: Props) => {
  const { t } = useTranslation('wallet');
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const pendingCredential = route.params?.pendingCredential;

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const onActivate = () => {
    dispatch(resetPresentation());
    // Defer the issuance of the requested credential (if any) until the PID has
    // been obtained; the PID middleware resumes it once the PID is available.
    if (pendingCredential) {
      dispatch(setPendingCredential(pendingCredential));
    }
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
    });
  };

  const onDismiss = () => {
    dispatch(resetPresentation());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="itWallet"
      title={t('notActive.title')}
      subtitle={t('notActive.body')}
      action={{
        label: t('notActive.confirm'),
        onPress: onActivate
      }}
      secondaryAction={{
        label: t('notActive.notNow'),
        onPress: onDismiss
      }}
    />
  );
};

export default PresentationWalletNotActive;
