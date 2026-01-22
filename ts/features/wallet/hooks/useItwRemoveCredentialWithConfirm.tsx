import { useIOToast } from '@pagopa/io-app-design-system';
import { Alert } from 'react-native';
import I18n from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch } from '../../../store';
import { RootStackParamList } from '../../../navigation/RootStacknavigator';
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
      I18n.t('presentation.credentialDetails.toast.removed', { ns: 'wallet' })
    );

    navigation.pop();
  };

  const confirmAndRemoveCredential = () =>
    Alert.alert(
      I18n.t('presentation.credentialDetails.dialogs.remove.title', {
        ns: 'wallet'
      }),
      I18n.t('presentation.credentialDetails.dialogs.remove.content', {
        ns: 'wallet'
      }),
      [
        {
          text: I18n.t('buttons.cancel', { ns: 'global' }),
          style: 'cancel'
        },
        {
          text: I18n.t(
            'presentation.credentialDetails.dialogs.remove.confirm',
            {
              ns: 'wallet'
            }
          ),
          style: 'destructive',
          onPress: handleRemoveCredential
        }
      ]
    );

  return {
    confirmAndRemoveCredential
  };
};
