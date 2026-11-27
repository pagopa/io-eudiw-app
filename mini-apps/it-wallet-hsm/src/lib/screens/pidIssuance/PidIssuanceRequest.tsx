import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetPidIssuance,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import {
  selectIsPidIssuanceStored,
  selectPendingCredential,
  selectPidIssuanceStatus
} from '../../store/selectors/pidIssuance';

/**
 * Screen which starts and owns the PID issuance flow.
 * As soon as the screen is rendered, the PID issuance related action is dispatched and the flow starts, while leaving it aborts the flow.
 * A loading screen is shown until the flow asks for the HSM password: then the user is navigated to the password screens and the PID preview,
 * which are stacked on top of this screen. It stays mounted and redirects the user to the failure or result screen.
 */
const PidIssuanceRequest = () => {
  const { t } = useTranslation(['hsm', 'common']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error, step } = useAppSelector(selectPidIssuanceStatus);
  const isPidStored = useAppSelector(selectIsPidIssuanceStored);
  const pendingCredential = useAppSelector(selectPendingCredential);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('discovery.screen.itw.dismissalDialog.body'),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel'),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm'),
      title: t('discovery.screen.itw.dismissalDialog.title')
    },
    handleDismiss: () => navigateToWallet()
  });

  // The password and preview screens are stacked on top of this screen while the issuance is in progress
  useHardwareBackButtonToDismiss(() => {
    if (navigation.isFocused()) {
      dismissalDialog.show();
    }
  });
  useDisableGestureNavigation();
  useEffect(() => {
    dispatch(setPidIssuanceRequest());
    return () => {
      dispatch(resetPidIssuance());
    };
  }, [dispatch]);

  useEffect(() => {
    if (step === 'passwordRequired') {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_PASSWORD_INTRO'
      });
    }
  }, [step, navigation]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_FAILURE'
      });
    }
  }, [error, navigation]);

  useEffect(() => {
    if (isPidStored && !pendingCredential) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_RESULT'
      });
    }
  }, [isPidStored, pendingCredential, navigation]);

  useHeaderSecondLevel({
    canGoBack: false,
    title: ''
  });

  return (
    <LoadingScreenContent
      contentTitle={t('pidIssuance.loading')}
      headerVisible
    />
  );
};

export default PidIssuanceRequest;
