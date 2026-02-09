import { ListItemAction, useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { memo } from 'react';
import { Alert, View } from 'react-native';
import { t } from 'i18next';
import { useAppDispatch } from '../../../../store';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { resetLifecycle } from '../../store/lifecycle';

const ItwPresentationPidDetailFooter = () => {
  const requestAssistanceLabel = t(
    'presentation.credentialDetails.actions.requestAssistance',
    {
      ns: 'wallet'
    }
  );

  const toast = useIOToast();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const handleRevokePress = () => {
    Alert.alert(
      t('presentation.itWalletId.dialog.revoke.title', { ns: 'wallet' }),
      t('presentation.itWalletId.dialog.revoke.message', { ns: 'wallet' }),
      [
        {
          text: t('presentation.itWalletId.dialog.revoke.cancel', {
            ns: 'wallet'
          }),
          style: 'cancel'
        },
        {
          text: t('presentation.itWalletId.dialog.revoke.confirm', {
            ns: 'wallet'
          }),
          style: 'destructive',
          onPress: () => {
            dispatch(resetLifecycle());
            toast.success(t('generics.success', { ns: 'global' }));
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View>
      <ListItemAction
        variant="primary"
        icon="website"
        label={t('presentation.credentialDetails.discoverItWallet', {
          ns: 'wallet'
        })}
        onPress={useNotAvailableToastGuard()}
      />
      <ListItemAction
        variant="primary"
        icon="message"
        label={requestAssistanceLabel}
        onPress={useNotAvailableToastGuard()}
      />
      <ListItemAction
        variant="danger"
        icon="trashcan"
        label={t('presentation.itWalletId.cta.revoke', { ns: 'wallet' })}
        onPress={handleRevokePress}
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
