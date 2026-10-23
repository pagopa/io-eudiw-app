import {
  IOScrollView,
  isIos,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useMaxBrightness
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import {
  Alert,
  BodySmall,
  H6,
  HeaderSecondLevel,
  hexToRgba,
  IOButton,
  IOColors,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { ItwBrandedBox } from '../../components/ItwBrandedBox';
import { ItwProximityQrCodeImage } from '../../components/proximity/ItwProximityQrCodeImage';
import { ItwProximityQrCodeInfoBanner } from '../../components/proximity/ItwProximityQrCodeInfoBanner';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import MAIN_ROUTES from '../../navigation/main/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectProximityInfoBannerActive,
  shouldShowExpiredProximityCredentialsBannerSelector
} from '../../store/credentials';
import {
  ProximityStatus,
  resetProximity,
  selectProximityEngagementMode,
  selectProximityErrorDetails,
  selectProximityFailure,
  selectProximityStatus,
  setProximityStatusStopped
} from '../../store/proximity';
import { checkNfcActivation } from '../../utils/nfc';

/**
 * Proximity engagement screen (QR mode). Shows the IT-Wallet branded QR Code
 * used to start a proximity presentation and offers an NFC fallback.
 * The presentation business logic lives in the proximity redux listener.
 */
const ItwProximityPresentmentScreen = () => {
  const { t } = useTranslation(['common', 'wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { startEngagement } = useProximityEngagement();

  const proximityStatus = useAppSelector(selectProximityStatus);
  const proximityFailure = useAppSelector(selectProximityFailure);
  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const engagementMode = useAppSelector(selectProximityEngagementMode);
  const proximtyInfoBannerActive = useAppSelector(
    selectProximityInfoBannerActive
  );
  const shouldShowExpiredCredentialsBanner = useAppSelector(
    shouldShowExpiredProximityCredentialsBannerSelector
  );

  useDebugInfo({
    engagementMode,
    proximityErrorDetailsQR: proximityErrorDetails ?? 'No errors',
    proximityStatusQR: proximityStatus
  });

  useMaxBrightness({ useSmoothTransition: true });
  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const toast = useNotAvailableToastGuard();

  const close = useCallback(() => {
    navigation.goBack();
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
  }, [dispatch, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          firstAction={{
            accessibilityLabel: I18n.t('buttons.close', { ns: 'common' }),
            icon: 'closeLarge',
            onPress: () => close()
          }}
          title={''}
          type="singleAction"
        />
      ),
      headerShown: true
    });
  }, [navigation, close]);

  useEffect(() => {
    // Only the active QR engagement drives navigation: once the user switches to
    // NFC the engagement mode flips and the NFC presentment screen takes over.
    if (engagementMode !== 'qrcode') {
      return;
    }
    if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW'
      });
    }
  }, [proximityStatus, navigation, engagementMode]);

  const handleContactlessPress = async () => {
    // Until an entitlement for NFC usage for this app is obtained, iOS flow
    // won't work, so we stop the action early [WLS-151]
    if (isIos) {
      toast();
      return;
    }

    // NFC activation gate: when NFC is off, route to the activation
    // instructions screen without committing to NFC (the QR engagement keeps
    // running underneath).
    if (!(await checkNfcActivation())) {
      navigation.navigate(MAIN_ROUTES.PROXIMITY_NFC_ACTIVATION);
      return;
    }
    // Switch the engagement to NFC and restart the proximity listener: the
    // `takeLatestEffect` cancels the running QR engagement and starts a fresh
    // one with the NFC configuration. Then move to the NFC presentment screen.
    startEngagement('nfc');
  };

  return (
    <IOScrollView>
      {shouldShowExpiredCredentialsBanner && (
        <Animated.View
          layout={LinearTransition.duration(200)}
          style={styles.expiredBanner}
        >
          <Alert
            action={t('wallet:proximity.engagement.invalidBanner.action')}
            content={t('wallet:proximity.engagement.invalidBanner.content')}
            onPress={() => toast()}
            testID="itwExpiredBannerTestID"
            variant="error"
          />
        </Animated.View>
      )}
      <View style={styles.qrCodeShadow}>
        <ItwBrandedBox
          backgroundVariant="gradient"
          variant={proximityFailure ? 'error' : 'default'}
        >
          <VStack space={16}>
            {!proximityFailure && (
              <VStack space={8} style={{ marginHorizontal: 16 }}>
                <H6 style={{ textAlign: 'center' }}>
                  {t('wallet:proximity.engagement.title')}
                </H6>
                <BodySmall style={{ textAlign: 'center' }}>
                  {t('wallet:proximity.engagement.instruction')}
                </BodySmall>
              </VStack>
            )}
            <ItwProximityQrCodeImage />
          </VStack>
        </ItwBrandedBox>
      </View>

      <View style={styles.nfcAction}>
        <BodySmall style={{ textAlign: 'center' }}>
          {t('wallet:proximity.engagement.nfc.or')}
        </BodySmall>
        <IOButton
          icon="contactless"
          iconPosition="end"
          label={t('wallet:proximity.engagement.nfc.action')}
          onPress={() => void handleContactlessPress()}
          variant="link"
        />
      </View>

      {proximtyInfoBannerActive && (
        <Animated.View layout={LinearTransition.duration(200)}>
          <VSpacer size={24} />
          <ItwProximityQrCodeInfoBanner />
        </Animated.View>
      )}
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  expiredBanner: {
    marginBottom: 24
  },
  nfcAction: {
    alignSelf: 'center',
    gap: 8,
    marginBottom: 24,
    marginTop: 32
  },
  qrCodeShadow: {
    boxShadow: `0px 4px 32px ${hexToRgba(IOColors.black, 0.1)}`
  }
});

export default ItwProximityPresentmentScreen;
