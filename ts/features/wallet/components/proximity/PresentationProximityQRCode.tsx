import { useEffect, memo } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { Body, H6, VSpacer, VStack } from '@pagopa/io-app-design-system';
import { NavigationProp, NavigationState } from '@react-navigation/native';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { useAppSelector } from '../../../../store';
import {
  ProximityStatus,
  selectProximityDisclosureDescriptor,
  selectProximityDisclosureIsAuthenticated,
  selectProximityQrCode,
  selectProximityStatus
} from '../../store/proximity';

type PresentationProximityQRCodeProps = {
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    'getState'
  > & {
    getState(): NavigationState | undefined;
  };
};

const PresentationProximityQRCode = ({
  navigation
}: PresentationProximityQRCodeProps) => {
  const { t } = useTranslation(['wallet']);
  const qrCode = useAppSelector(selectProximityQrCode);
  const proximityStatus = useAppSelector(selectProximityStatus);
  const descriptor = useAppSelector(selectProximityDisclosureDescriptor);
  const isAuthenticated = useAppSelector(
    selectProximityDisclosureIsAuthenticated
  );

  useEffect(() => {
    if (
      proximityStatus ===
        ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED &&
      descriptor
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW',
        params: { descriptor, isAuthenticated }
      });
    }
    // If we reach this state, it means that a connection has already been established but failed before
    // reaching the preview screen: the bottom spinner of the modal has been activated,
    // which means that the user perceived something started, and thus should be informed that
    // something went wrong by navigating to the error screen
    else if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_FAILURE',
        params: { fatal: true }
      });
    }
  }, [proximityStatus, navigation, descriptor]);

  return (
    <View>
      {qrCode ? (
        <QRCode size={150} value={qrCode} />
      ) : (
        <LoadingIndicator size={24} />
      )}
      <VSpacer size={40} />
      <Body>{t('wallet:proximity.showQr.body')}</Body>
      <VSpacer size={40} />
      {(proximityStatus === ProximityStatus.PROXIMITY_STATUS_CONNECTED ||
        proximityStatus ===
          ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT) && (
        <VStack space={16} style={{ alignItems: 'center' }}>
          <LoadingIndicator size={24} />
          <H6 textStyle={{ textAlign: 'center' }}>
            {t('wallet:proximity.connected.body')}
          </H6>
          <VSpacer size={32} />
        </VStack>
      )}
    </View>
  );
};

const MemoizedPresentationProcimityQRCode = memo(PresentationProximityQRCode);

export { MemoizedPresentationProcimityQRCode as PresentationProximityQrCode };
