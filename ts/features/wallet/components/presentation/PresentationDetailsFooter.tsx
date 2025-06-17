import {
  ButtonSolid,
  ListItemAction,
  useIOToast,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import React, {memo, useCallback, useEffect} from 'react';
import {Alert, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {removeCredential} from '../../store/credentials';
import {StoredCredential} from '../../utils/types';
import {useIOBottomSheetModal} from '../../../../hooks/useBottomSheet';
import {
  resetProximity,
  selectProximityStatus,
  setProximityStatusStopped
} from '../../store/proximity';
import {PresentationProximityQrCode} from '../proximity/PresentationProximityQRCode';

type PresentationDetailFooterProps = {
  credential: StoredCredential;
};

/**
 * Footer component which is supposed to be rendered at the bottom of the credential details screen.
 * It renders a button to remove the credential.
 */
const PresentationDetailsFooter = ({
  credential
}: PresentationDetailFooterProps) => {
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const toast = useIOToast();
  const {t} = useTranslation(['wallet', 'global']);
  const proximityStatus = useAppSelector(selectProximityStatus);

  const QrCodeModal = useIOBottomSheetModal({
    title: t('wallet:proximity.showQr.title'),
    component: <PresentationProximityQrCode navigation={navigation} />,
    onDismiss: () => {
      // In case the flow is stopped before receiving a document
      if (proximityStatus === 'started') {
        dispatch(setProximityStatusStopped());
        dispatch(resetProximity());
      }
    }
  });

  useEffect(() => {
    // These states indicate that the modal can be dismissed
    if (
      proximityStatus === 'received-document' ||
      proximityStatus === 'error' ||
      proximityStatus === 'aborted'
    ) {
      QrCodeModal.dismiss();
    }
  }, [proximityStatus, QrCodeModal, navigation]);

  const RemoveCredential = useCallback(() => {
    const handleRemoveCredential = () => {
      dispatch(removeCredential(credential));
      toast.success(t('global:generics.success'));
      navigation.goBack();
    };
    const showRemoveCredentialDialog = () =>
      Alert.alert(
        t('wallet:presentation.credentialDetails.footer.removal.dialog.title'),
        t(
          'wallet:presentation.credentialDetails.footer.removal.dialog.content'
        ),
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
    );
  }, [t, credential, dispatch, navigation, toast]);

  return credential.format === 'mso_mdoc' ? (
    <>
      <VSpacer size={16} />
      <VStack space={16}>
        <ButtonSolid
          fullWidth
          label={t('wallet:proximity.showQr.title')}
          onPress={() => QrCodeModal.present()}
          icon="qrCode"
          iconPosition="end"
        />
        {QrCodeModal.bottomSheet}
        <RemoveCredential />
      </VStack>
    </>
  ) : (
    <View>
      <RemoveCredential />
    </View>
  );
};

const MemoizedPresentationDetailsFooter = memo(PresentationDetailsFooter);

export {MemoizedPresentationDetailsFooter as PresentationDetailsFooter};
