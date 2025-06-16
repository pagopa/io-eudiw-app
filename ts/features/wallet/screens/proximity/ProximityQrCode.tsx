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
import { useAppDispatch, useAppSelector } from '../../../../store';
import { resetProximity, selectProximityDisclosureDescriptor, selectProximityQrCode, selectProximityStatus, setProximityStatusStarted, setProximityStatusStopped } from '../../store/proximity';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';

/**
 * Shows the QR code for the proximity presentation.
 * It also shows the current state of the proximity presentation and a state message.
 */
const ProximityQrCode = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const navigation = useNavigation();
  const qrCode = useAppSelector(selectProximityQrCode);
  const proximityStatus = useAppSelector(selectProximityStatus);
  const proximityDisclosureDescriptor = useAppSelector(
    selectProximityDisclosureDescriptor
  );
  const dispatch = useAppDispatch();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    title: '',
    goBack: async () => {
      navigation.goBack();
      dispatch(setProximityStatusStopped())
      dispatch(resetProximity())
    }
  });


  useEffect(() => {
    dispatch(setProximityStatusStarted());
  }, [dispatch]);

  useEffect(() => {
    if (
      proximityStatus === 'authorization-started' &&
      proximityDisclosureDescriptor
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_PREVIEW',
        params: {descriptor: proximityDisclosureDescriptor}
      });
    } else if (proximityStatus === 'error' || proximityStatus === 'aborted') {
      navigation.navigate('MAIN_WALLET_NAV', {screen: 'PROXIMITY_FAILURE'});
    }
  }, [proximityStatus, proximityDisclosureDescriptor, navigation]);

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
        ) : <>
          <VSpacer size={24} />
          <LoadingIndicator size={24} />
        </>}
      {proximityStatus === 'connected' || proximityStatus === 'received-document' && (
        <VStack space={16} style={IOStyles.alignCenter}>
          <LoadingIndicator size={24} />
          <H6 textStyle={{textAlign: 'center'}}>
            {t('wallet:proximity.connected.body')}
          </H6>
          <VSpacer size={32} />
        </VStack>
      )}
      </View>
    </ContentWrapper>
  );
};

export default ProximityQrCode;
