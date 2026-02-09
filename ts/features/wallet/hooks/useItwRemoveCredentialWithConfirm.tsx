import { useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { t } from 'i18next';
import { RootStackParamList } from '../../../navigation/RootStacknavigator';
import { useAppDispatch } from '../../../store';
import { removeCredential } from '../store/credentials';
import { StoredCredential } from '../utils/itwTypesUtils';

/**
 * Hook that shows a confirmation dialog and, if confirmed, removes a credential from the wallet
 */
export const useItwRemoveCredentialWithConfirm = (
  credential: StoredCredential
) => {
  const dispatch = useAppDispatch();
  const toast = useIOToast();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleRemoveCredential = () => {
    dispatch(removeCredential(credential));
    toast.success(
      t('presentation.credentialDetails.toast.removed', { ns: 'wallet' })
    );

    navigation.pop();
  };

  const confirmAndRemoveCredential = () =>
    Alert.alert(
      t('presentation.credentialDetails.dialogs.remove.title', {
        ns: 'wallet'
      }),
      t('presentation.credentialDetails.dialogs.remove.content', {
        ns: 'wallet'
      }),
      [
        {
          text: t('buttons.cancel', { ns: 'global' }),
          style: 'cancel'
        },
        {
          text: t('presentation.credentialDetails.dialogs.remove.confirm', {
            ns: 'wallet'
          }),
          style: 'destructive',
          onPress: handleRemoveCredential
        }
      ]
    );

  return {
    confirmAndRemoveCredential
  };
};
