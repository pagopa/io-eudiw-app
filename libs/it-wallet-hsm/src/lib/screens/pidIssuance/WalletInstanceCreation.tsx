import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { createInstanceThunk } from '../../middleware/instance';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetInstanceCreation } from '../../store/pidIssuance';
import { selectInstanceStatus } from '../../store/selectors/pidIssuance';

type CreateInstancePromise = ReturnType<ReturnType<typeof createInstanceThunk>>;

/**
 * Screen which silently creates the wallet instance as soon as it is rendered.
 * It shows a loading indicator until the instance has been created, then
 * proceeds straight to the PID issuance request.
 */
export const WalletInstanceCreation = () => {
  const { t } = useTranslation(['itWalletHsm', 'common']);
  const navigation = useNavigation();
  const { error, loading, success } = useAppSelector(selectInstanceStatus);
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const thunkRef = useRef<CreateInstancePromise | null>(null);

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('discovery.screen.itw.dismissalDialog.body'),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel'),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm'),
      title: t('discovery.screen.itw.dismissalDialog.title')
    },
    handleDismiss: () => {
      thunkRef.current?.abort();
      navigateToWallet();
    }
  });

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    goBack: () => dismissalDialog.show(),
    title: ''
  });

  useEffect(() => {
    const promise = dispatch(createInstanceThunk());
    thunkRef.current = promise;
  }, [dispatch]);

  useEffect(() => {
    if (success.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_REQUEST'
      });
      dispatch(resetInstanceCreation());
    }
  }, [success, navigation, dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_FAILURE'
      });
    }
  }, [error, navigation]);

  if (!loading) {
    return null;
  }

  return <LoadingScreenContent contentTitle={t('common:waiting')} />;
};
