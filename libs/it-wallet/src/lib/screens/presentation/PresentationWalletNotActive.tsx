import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch } from '../../store';
import {
  PendingCredential,
  setPendingCredential
} from '../../store/pidIssuance';
import { resetPresentation } from '../../store/presentation';
import {
  getCredentialNameByType,
  getCredentialTypeByConfigId
} from '../../utils/credentials';

/**
 * Navigation params for the wallet-not-active screen.
 * `pendingCredential` is provided by the credential issuance flow (e.g. a
 * credential offer): it is stored as pending when the user starts the wallet
 * activation so the issuance resumes automatically once the PID is available.
 */
export type PresentationWalletNotActiveParams =
  | undefined
  | {
      pendingCredential?: NonNullable<PendingCredential>;
    };

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

  // When reached from a credential offer the screen invites the user to
  // activate the wallet to add the requested credential; otherwise (pure
  // presentation flow) it keeps the generic activation copy.
  const isCredentialOffer = pendingCredential !== undefined;

  const credentialName = getCredentialNameByType(
    getCredentialTypeByConfigId(pendingCredential?.credential ?? '')
  );

  return (
    <OperationResultScreenContent
      action={{
        label: isCredentialOffer
          ? t('notActive.credentialOffer.confirm')
          : t('notActive.confirm'),
        onPress: onActivate
      }}
      pictogram="itWallet"
      secondaryAction={{
        label: isCredentialOffer
          ? t('notActive.credentialOffer.cancel')
          : t('notActive.notNow'),
        onPress: onDismiss
      }}
      subtitle={
        isCredentialOffer
          ? t('notActive.credentialOffer.body')
          : t('notActive.body')
      }
      title={
        isCredentialOffer
          ? t('notActive.credentialOffer.title', { credentialName })
          : t('notActive.title')
      }
    />
  );
};

export default PresentationWalletNotActive;
