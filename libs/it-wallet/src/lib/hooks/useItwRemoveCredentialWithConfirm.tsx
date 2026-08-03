import { useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { Alert } from 'react-native';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import { useAppDispatch } from '../store';
import { removeCredential } from '../store/credentials';
import { StoredCredentialMetadata } from '../utils/itwTypesUtils';

/**
 * Hook that shows a confirmation dialog and, if confirmed, removes a credential from the wallet
 */
export const useItwRemoveCredentialWithConfirm = (
  credential: StoredCredentialMetadata
) => {
  const dispatch = useAppDispatch();
  const toast = useIOToast();
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();

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
          style: 'cancel',
          text: t('buttons.cancel', { ns: 'common' })
        },
        {
          onPress: handleRemoveCredential,
          style: 'destructive',
          text: t('presentation.credentialDetails.dialogs.remove.confirm', {
            ns: 'wallet'
          })
        }
      ]
    );

  return {
    confirmAndRemoveCredential
  };
};
