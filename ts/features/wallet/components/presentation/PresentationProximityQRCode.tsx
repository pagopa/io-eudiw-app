import React, {useEffect, memo} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useTranslation} from 'react-i18next';
import {Body, VSpacer} from '@pagopa/io-app-design-system';
import {NavigationProp, NavigationState} from '@react-navigation/native';
import {LoadingIndicator} from '../../../../components/LoadingIndicator';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  selectProximityQrCode,
  selectProximityStatus,
  setProximityStatusStarted
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
  const {t} = useTranslation(['wallet']);
  const qrCode = useAppSelector(selectProximityQrCode);
  const proximityStatus = useAppSelector(selectProximityStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setProximityStatusStarted());
  }, [dispatch]);

  useEffect(() => {
    if (proximityStatus === 'authorization-started') {
      navigation.navigate('MAIN_WALLET_NAV', {screen: 'PROXIMITY_PREVIEW'});
    }
  }, [proximityStatus, navigation]);

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
    </View>
  );
};

const MemoizedPresentationProcimityQRCode = memo(PresentationProximityQRCode);

export {MemoizedPresentationProcimityQRCode as PresentationProximityQrCode};
