import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useAppDispatch } from '../../store';
import { resetPresentation } from '../../store/presentation';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import WALLET_ROUTES from '../../navigation/wallet/routes';

/**
 * Error screen shown during the presentation flow when the wallet has not been
 * activated yet (lifecycle is LIFECYCLE_OPERATIONAL). It prompts the user to
 * start the wallet activation flow or go back to the wallet home screen.
 */
const PresentationWalletNotActive = () => {
  const { t } = useTranslation('wallet');
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const onActivate = () => {
    dispatch(resetPresentation());
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
