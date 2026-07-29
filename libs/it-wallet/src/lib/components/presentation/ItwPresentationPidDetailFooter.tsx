import { ListItemAction, useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { memo } from 'react';
import { Alert, View } from 'react-native';

import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { useAppDispatch } from '../../store';
import { resetLifecycle } from '../../store/lifecycle';

const ItwPresentationPidDetailFooter = ({
  successToastLabel
}: {
  successToastLabel: string;
}) => {
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
          style: 'cancel',
          text: t('presentation.itWalletId.dialog.revoke.cancel', {
            ns: 'wallet'
          })
        },
        {
          onPress: () => {
            dispatch(resetLifecycle());
            toast.success(successToastLabel);
            navigation.goBack();
          },
          style: 'destructive',
          text: t('presentation.itWalletId.dialog.revoke.confirm', {
            ns: 'wallet'
          })
        }
      ]
    );
  };

  return (
    <View>
      <ListItemAction
        icon="website"
        label={t('presentation.credentialDetails.discoverItWallet', {
          ns: 'wallet'
        })}
        onPress={useNotAvailableToastGuard()}
        variant="primary"
      />
      <ListItemAction
        icon="message"
        label={requestAssistanceLabel}
        onPress={useNotAvailableToastGuard()}
        variant="primary"
      />
      <ListItemAction
        icon="trashcan"
        label={t('presentation.itWalletId.cta.revoke', { ns: 'wallet' })}
        onPress={handleRevokePress}
        variant="danger"
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
