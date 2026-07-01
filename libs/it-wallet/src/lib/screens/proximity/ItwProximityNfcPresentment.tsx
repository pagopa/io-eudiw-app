import { H4, IOButton, Pictogram, VStack } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import {
  IOScrollView,
  LoadingIndicator,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityDisclosureIsAuthenticated,
  selectProximityEngagementMode,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityStatusStopped
} from '../../store/proximity';
import { useAppDispatch, useAppSelector } from '../../store';

/**
 * NFC (contactless) proximity presentment screen.
 * On iOS the native NFC system sheet drives the HCE engagement, so this screen
 * is a textual fallback; on Android the user holds the phone near the reader
 * while the Host Card Emulation session is active.
 *
 * The presentation business logic lives in the proximity redux listener: once a
 * request is received (`AUTHORIZATION_STARTED`) the user is taken to the claims
 * disclosure screen, exactly like the QR engagement.
 */
const ItwProximityNfcPresentment = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const proximityStatus = useAppSelector(selectProximityStatus);
  const descriptor = useAppSelector(selectProximityDisclosureDescriptor);
  const isAuthenticated = useAppSelector(
    selectProximityDisclosureIsAuthenticated
  );
  const engagementMode = useAppSelector(selectProximityEngagementMode);
  const errorDetails = useAppSelector(selectProximityErrorDetails);

  const isSending =
    proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND;
  const isSuccess =
    proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE;

  useDebugInfo({
    proximityStatusNfc: proximityStatus,
    proximityErrorDetailsNfc: errorDetails ?? 'No errors',
    engagementMode
  });

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useEffect(() => {
    // Only the active NFC engagement drives navigation from this screen.
    if (engagementMode !== 'nfc') {
      return;
    }
    if (
      proximityStatus ===
        ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED &&
      descriptor
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW',
        params: { descriptor, isAuthenticated }
      });
    } else if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_FAILURE',
        params: { fatal: true }
      });
    }
  }, [
    proximityStatus,
    navigation,
    descriptor,
    isAuthenticated,
    engagementMode
  ]);

  const handleDismiss = () => {
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
    navigateToWallet();
  };

  const title = useMemo(() => {
    if (isSuccess) {
      return t('wallet:proximity.nfcEngagement.success');
    }
    if (isSending) {
      return t('wallet:proximity.nfcEngagement.sending');
    }
    return Platform.OS === 'ios'
      ? t('wallet:proximity.nfcEngagement.ready.ios')
      : t('wallet:proximity.nfcEngagement.ready.android');
  }, [isSuccess, isSending, t]);

  return (
    <IOScrollView centerContent={true}>
      <VStack space={24} style={{ alignItems: 'center' }}>
        {Platform.OS !== 'ios' && (
          <Pictogram
            size={180}
            name={isSuccess ? 'success' : 'nfcScanAndroid'}
          />
        )}
        <H4 style={{ textAlign: 'center' }}>{title}</H4>
        {isSending && (
          <View style={{ alignItems: 'center' }}>
            <LoadingIndicator />
          </View>
        )}
        <View style={{ alignSelf: 'center' }}>
          <IOButton
            variant="link"
            label={
              isSuccess ? t('common:buttons.close') : t('common:buttons.cancel')
            }
            onPress={handleDismiss}
          />
        </View>
      </VStack>
    </IOScrollView>
  );
};

export default ItwProximityNfcPresentment;
