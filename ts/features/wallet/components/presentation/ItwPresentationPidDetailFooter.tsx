import { ListItemAction, useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { memo } from 'react';
import { Alert, View } from 'react-native';
import { useAppDispatch } from '../../../../store';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { resetLifecycle } from '../../store/lifecycle';

const ItwPresentationPidDetailFooter = () => {
  const requestAssistanceLabel = I18n.t(
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
      I18n.t('presentation.itWalletId.dialog.revoke.title', { ns: 'wallet' }),
      I18n.t('presentation.itWalletId.dialog.revoke.message', { ns: 'wallet' }),
      [
        {
          text: I18n.t('presentation.itWalletId.dialog.revoke.cancel', {
            ns: 'wallet'
          }),
          style: 'cancel'
        },
        {
          text: I18n.t('presentation.itWalletId.dialog.revoke.confirm', {
            ns: 'wallet'
          }),
          style: 'destructive',
          onPress: () => {
            dispatch(resetLifecycle());
            toast.success(I18n.t('generics.success', { ns: 'global' }));
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
        label={I18n.t('presentation.credentialDetails.discoverItWallet', {
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
        label={I18n.t('presentation.itWalletId.cta.revoke', { ns: 'wallet' })}
        onPress={handleRevokePress}
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
