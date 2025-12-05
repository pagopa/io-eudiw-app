import {useTranslation} from 'react-i18next';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Body,
  ContentWrapper,
  H2,
  H6,
  IOStyles,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityDisclosureIsAuthenticated,
  selectProximityErrorDetails,
  selectProximityQrCode,
  selectProximityStatus,
  setProximityStatusStopped
} from '../../store/proximity';
import {LoadingIndicator} from '../../../../components/LoadingIndicator';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';

/**
 * Shows the QR code for the proximity presentation.
 * It also shows the current state of the proximity presentation and a state message.
 */
const ProximityQrCode = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const navigation = useNavigation();
  const qrCode = useAppSelector(selectProximityQrCode);
  const proximityStatus = useAppSelector(selectProximityStatus);
  const descriptor = useAppSelector(selectProximityDisclosureDescriptor);
  const isAuthenticated = useAppSelector(
    selectProximityDisclosureIsAuthenticated
  );
  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);

  useDebugInfo({
    proximityDisclosureDescriptorQR: descriptor,
    proximityStatusQR: proximityStatus,
    proximityErrorDetailsQR: proximityErrorDetails ?? 'No errors'
  });

  const dispatch = useAppDispatch();

  useHeaderSecondLevel({
    title: ''
  });

  useEffect(() => {
    if (
      proximityStatus ===
        ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED &&
      descriptor
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW',
        params: {descriptor, isAuthenticated}
      });
      // If we reach this state, it means that a connection has already been established but failed before
      // reaching the preview screen: the bottom spinner of the modal has been activated,
      // which means that the user perceived something started, and thus should be informed that
      // something went wrong by navigating to the error screen
    } else if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_FAILURE',
        params: {fatal: true}
      });
    }

    // Clean on unmount
    return () => {
      dispatch(setProximityStatusStopped());
      dispatch(resetProximity());
    };
  }, [proximityStatus, navigation, descriptor, isAuthenticated, dispatch]);

  return (
    <ContentWrapper>
      <H2>{t('wallet:proximity.showQr.title')}</H2>
      <VSpacer size={16} />
      <Body>{t('wallet:proximity.showQr.body')}</Body>
      <VSpacer size={40} />
      <View style={{alignItems: 'center'}}>
        {qrCode ? (
          <>
            <QRCode size={280} value={qrCode} />
            <VSpacer size={24} />
          </>
        ) : (
          <>
            <VSpacer size={24} />
            <LoadingIndicator size={24} />
          </>
        )}
        {proximityStatus === ProximityStatus.PROXIMITY_STATUS_CONNECTED ||
          (proximityStatus ===
            ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT && (
            <VStack space={16} style={IOStyles.alignCenter}>
              <LoadingIndicator size={24} />
              <H6 textStyle={{textAlign: 'center'}}>
                {t('wallet:proximity.connected.body')}
              </H6>
              <VSpacer size={32} />
            </VStack>
          ))}
      </View>
    </ContentWrapper>
  );
};

export default ProximityQrCode;
