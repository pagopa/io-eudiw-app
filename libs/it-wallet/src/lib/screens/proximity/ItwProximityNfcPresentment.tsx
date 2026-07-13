import {
  H4,
  HStack,
  IOButton,
  IOColors,
  IOVisualCostants,
  Pictogram
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CircularProgress,
  IOScrollView,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import {
  ProximityStatus,
  resetProximity,
  selectProximityEngagementMode,
  selectProximityErrorDetails,
  selectProximityRetrievalMethod,
  selectProximityStatus,
  setProximityStatusStopped
} from '../../store/proximity';
import { useAppDispatch, useAppSelector } from '../../store';

type ContentProps = {
  title: string;
  isSuccess: boolean;
  onDismiss: () => void;
};

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
  const engagementMode = useAppSelector(selectProximityEngagementMode);
  const retrievalMethod = useAppSelector(selectProximityRetrievalMethod);
  const errorDetails = useAppSelector(selectProximityErrorDetails);

  const [authorizationSent, setAuthorizationSent] = useState<boolean>(false);

  const isSending =
    proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND;
  const isSuccess =
    authorizationSent &&
    proximityStatus === ProximityStatus.PROXIMITY_STATUS_STOPPED;

  useDebugInfo({
    proximityStatusNfc: proximityStatus,
    proximityErrorDetailsNfc: errorDetails ?? 'No errors',
    engagementMode
  });

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  const handleDismiss = () => {
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
    navigateToWallet();
  };

  useEffect(() => {
    // Only the active NFC engagement drives navigation from this screen.
    if (engagementMode !== 'nfc') {
      return;
    }

    // BLE retrieval method needs to react differently
    if (retrievalMethod === 'ble') {
      if (
        proximityStatus === ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT
      ) {
        navigation.navigate('MAIN_WALLET_NAV', {
          screen: 'PROXIMITY_PREVIEW'
        });
        return;
      }
    }

    if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW'
      });
    } else if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_FAILURE',
        params: { fatal: true }
      });
    } else if (
      proximityStatus ===
      ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE
    ) {
      setAuthorizationSent(true);
    }
  }, [proximityStatus, navigation, engagementMode]);

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

  return Platform.select({
    ios: (
      <IOsContent
        title={title}
        isSuccess={isSuccess}
        onDismiss={handleDismiss}
      />
    ),
    default: (
      <AndroidContent
        title={title}
        isSuccess={isSuccess}
        onDismiss={handleDismiss}
      />
    )
  });
};

const IOsContent = ({ title, isSuccess, onDismiss }: ContentProps) => {
  const { t } = useTranslation(['common']);
  const insets = useSafeAreaInsets();

  return (
    <IOScrollView
      actions={{
        type: 'SingleButton',
        primary: {
          label: t('common:buttons.close'),
          onPress: onDismiss
        }
      }}
    >
      <View style={[styles.container, { marginTop: insets.top }]}>
        <HStack>
          <H4 textStyle={styles.title}>{title} </H4>
          {isSuccess ? <Pictogram name="success" size={120} /> : null}
        </HStack>
      </View>
    </IOScrollView>
  );
};

const AndroidContent = ({ title, isSuccess, onDismiss }: ContentProps) => {
  const { t } = useTranslation(['common']);

  return (
    <IOScrollView centerContent={true}>
      <View style={{ alignItems: 'center', gap: 24 }}>
        <CircularProgress
          size={240}
          radius={120}
          progress={isSuccess ? 100 : 0}
          strokeColor={IOColors['blueIO-500']}
          strokeBgColor={IOColors['grey-200']}
          strokeWidth={4}
        >
          <Pictogram
            size={180}
            name={isSuccess ? 'success' : 'nfcScanAndroid'}
          />
        </CircularProgress>
        <H4 textStyle={{ textAlign: 'center' }}>{title}</H4>
        <View style={{ alignSelf: 'center' }}>
          <IOButton
            variant="link"
            label={
              isSuccess ? t('common:buttons.close') : t('common:buttons.cancel')
            }
            onPress={onDismiss}
          />
        </View>
      </View>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: IOVisualCostants.headerHeight
  },
  title: {
    flex: 1,
    marginTop: 24
  }
});

export default ItwProximityNfcPresentment;
