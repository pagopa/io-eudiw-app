import {ListItemAction, useIOToast} from '@pagopa/io-app-design-system';
import React, {memo} from 'react';
import {Alert, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../../../store';
import {removeCredential} from '../../store/credentials';
import {StoredCredential} from '../../utils/types';

type PresentationDetailFooterProps = {
  credential: StoredCredential;
};

const PresentationDetailsFooter = ({
  credential
}: PresentationDetailFooterProps) => {
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const toast = useIOToast();
  const {t} = useTranslation(['wallet', 'global']);

  const handleRemoveCredential = () => {
    dispatch(removeCredential(credential));
    toast.success(t('global:generics.success'));
    navigation.goBack();
  };

  const showRemoveCredentialDialog = () =>
    Alert.alert(
      t('wallet:presentation.credentialDetails.footer.removal.dialog.title'),
      t('wallet:presentation.credentialDetails.footer.removal.dialog.content'),
      [
        {
          text: t(
            'wallet:presentation.credentialDetails.footer.removal.dialog.confirm'
          ),
          style: 'destructive',
          onPress: handleRemoveCredential
        },
        {
          text: t('global:buttons.cancel'),
          style: 'cancel'
        }
      ]
    );

  return (
    <View>
      <ListItemAction
        testID="removeCredentialActionTestID"
        variant="danger"
        icon="trashcan"
        label={t('wallet:presentation.credentialDetails.footer.removal.remove')}
        accessibilityLabel={t(
          'wallet:presentation.credentialDetails.footer.removal.remove'
        )}
        onPress={showRemoveCredentialDialog}
      />
    </View>
  );
};

const MemoizedPresentationDetailsFooter = memo(PresentationDetailsFooter);

export {MemoizedPresentationDetailsFooter as PresentationDetailsFooter};
