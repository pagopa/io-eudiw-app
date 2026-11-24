import { useIOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { Alert } from 'react-native';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import { useAppDispatch } from '../store';
import { removeCredential } from '../store/credentials';
import { resetLifecycle } from '../store/lifecycle';
import { wellKnownCredential } from '../utils/credentials';
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
    // The PID can't be removed alone: removing it resets the wallet lifecycle
    dispatch(
      credential.credentialType === wellKnownCredential.PID
        ? resetLifecycle()
        : removeCredential(credential)
    );
    toast.success(
      t('presentation.credentialDetails.toast.removed', { ns: 'hsm' })
    );

    navigation.pop();
  };

  const isPid = credential.credentialType === wellKnownCredential.PID;

  const confirmAndRemoveCredential = () =>
    isPid
      ? Alert.alert(
          t('presentation.credentialDetails.dialogs.deactivate.title', {
            ns: 'hsm'
          }),
          t('presentation.credentialDetails.dialogs.deactivate.content', {
            ns: 'hsm'
          }),
          [
            {
              onPress: handleRemoveCredential,
              style: 'destructive',
              text: t(
                'presentation.credentialDetails.dialogs.deactivate.confirm',
                { ns: 'hsm' }
              )
            },
            {
              style: 'cancel',
              text: t(
                'presentation.credentialDetails.dialogs.deactivate.cancel',
                { ns: 'hsm' }
              )
            }
          ]
        )
      : Alert.alert(
          t('presentation.credentialDetails.dialogs.remove.title', {
            ns: 'hsm'
          }),
          t('presentation.credentialDetails.dialogs.remove.content', {
            ns: 'hsm'
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
                ns: 'hsm'
              })
            }
          ]
        );

  return {
    confirmAndRemoveCredential,
    isPid
  };
};
