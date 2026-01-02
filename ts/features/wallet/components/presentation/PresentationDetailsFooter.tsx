import {
  ButtonSolid,
  ListItemAction,
  useIOToast,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { memo, useCallback, useEffect } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { removeCredential } from '../../store/credentials';
import { StoredCredential } from '../../utils/types';
import { useIOBottomSheetModal } from '../../../../hooks/useBottomSheet';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../../store/proximity';
import { PresentationProximityQrCode } from '../proximity/PresentationProximityQRCode';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { wellKnownCredential } from '../../utils/credentials';
import { resetLifecycle } from '../../store/lifecycle';

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
  const { t } = useTranslation(['wallet', 'global']);
  const proximityStatus = useAppSelector(selectProximityStatus);
  const proximityDisclosureDescriptor = useAppSelector(
    selectProximityDisclosureDescriptor
  );
  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);

  useDebugInfo(
    credential.format === 'mso_mdoc'
      ? {
          proximityDisclosureDescriptorQR: proximityDisclosureDescriptor,
          proximityStatusQR: proximityStatus,
          proximityErrorDetailsQR: proximityErrorDetails ?? 'No errors'
        }
      : {}
  );

  const QrCodeModal = useIOBottomSheetModal({
    title: t('wallet:proximity.showQr.title'),
    component: <PresentationProximityQrCode navigation={navigation} />,
    onDismiss: () => {
      // In case the flow is stopped before receiving a document
      if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_STARTED) {
        dispatch(setProximityStatusStopped());
        dispatch(resetProximity());
      }
    }
  });

  useEffect(() => {
    // These states indicate that the modal can be dismissed
    if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      QrCodeModal.dismiss();
    }
  }, [proximityStatus, QrCodeModal, navigation]);

  const RemoveCredential = useCallback(() => {
    const handleRemoveCredential = () => {
      if (credential.credentialType === wellKnownCredential.PID) {
        // If the credential is a PID, we reset the lifecycle to a complete wallet state reset
        dispatch(resetLifecycle());
      } else {
        dispatch(removeCredential(credential));
      }
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
          onPress={() => {
            dispatch(setProximityStatusStarted());
            QrCodeModal.present();
          }}
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

export { MemoizedPresentationDetailsFooter as PresentationDetailsFooter };
