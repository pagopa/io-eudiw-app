import {
  BodySmall,
  H6,
  hexToRgba,
  IOButton,
  IOColors,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
  IOScrollView,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel,
  useMaxBrightness
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { ItwBrandedBox } from '../../components/ItwBrandedBox';
import { ItwProximityQrCodeImage } from '../../components/proximity/ItwProximityQrCodeImage';
import { ItwProximityQrCodeInfoBanner } from '../../components/proximity/ItwProximityQrCodeInfoBanner';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityDisclosureIsAuthenticated,
  selectProximityEngagementMode,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityEngagementMode,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../../store/proximity';
import { useAppDispatch, useAppSelector } from '../../store';

/**
 * Proximity engagement screen (QR mode). Shows the IT-Wallet branded QR Code
 * used to start a proximity presentation and offers an NFC fallback.
 * The presentation business logic lives in the proximity redux listener.
 */
const ProximityQrCode = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const proximityStatus = useAppSelector(selectProximityStatus);
  const descriptor = useAppSelector(selectProximityDisclosureDescriptor);
  const isAuthenticated = useAppSelector(
    selectProximityDisclosureIsAuthenticated
  );
  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const engagementMode = useAppSelector(selectProximityEngagementMode);

  useDebugInfo({
    proximityStatusQR: proximityStatus,
    proximityErrorDetailsQR: proximityErrorDetails ?? 'No errors',
    engagementMode
  });

  useMaxBrightness({ useSmoothTransition: true });
  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const close = () => {
    navigation.goBack();
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
  };

  useHeaderSecondLevel({
    title: '',
    goBack: close
  });

  useEffect(() => {
    // Only the active QR engagement drives navigation: once the user switches to
    // NFC the engagement mode flips and the NFC presentment screen takes over.
    if (engagementMode !== 'qrcode') {
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
      // If we reach this state, it means that a connection has already been established but failed before
      // reaching the preview screen, and thus the user should be informed that
      // something went wrong by navigating to the error screen.
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

  const handleContactlessPress = () => {
    // Switch the engagement to NFC and restart the proximity listener: the
    // `takeLatestEffect` cancels the running QR engagement and starts a fresh
    // one with the NFC configuration. Then move to the NFC presentment screen.
    dispatch(setProximityEngagementMode('nfc'));
    dispatch(setProximityStatusStarted());
    navigation.navigate('MAIN_NFC_PRESENTMENT');
  };

  return (
    <IOScrollView>
      <View style={styles.qrCodeShadow}>
        <ItwBrandedBox backgroundVariant="gradient">
          <VStack space={16}>
            <VStack space={8} style={{ marginHorizontal: 16 }}>
              <H6 style={{ textAlign: 'center' }}>
                {t('wallet:proximity.engagement.title')}
              </H6>
              <BodySmall style={{ textAlign: 'center' }}>
                {t('wallet:proximity.engagement.instruction')}
              </BodySmall>
            </VStack>
            <ItwProximityQrCodeImage />
          </VStack>
        </ItwBrandedBox>
      </View>

      <View style={styles.nfcAction}>
        <BodySmall style={{ textAlign: 'center' }}>
          {t('wallet:proximity.engagement.nfc.or')}
        </BodySmall>
        <IOButton
          variant="link"
          label={t('wallet:proximity.engagement.nfc.action')}
          onPress={handleContactlessPress}
          icon="contactless"
          iconPosition="end"
        />
      </View>

      <Animated.View layout={LinearTransition.duration(200)}>
        <VSpacer size={24} />
        <ItwProximityQrCodeInfoBanner />
      </Animated.View>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  qrCodeShadow: {
    boxShadow: `0px 4px 32px ${hexToRgba(IOColors.black, 0.1)}`
  },
  nfcAction: {
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 24,
    gap: 8
  }
});

export default ProximityQrCode;
