import React, {useEffect, memo} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useTranslation} from 'react-i18next';
import {
  Body,
  H6,
  IOStyles,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import {NavigationProp, NavigationState} from '@react-navigation/native';
import {LoadingIndicator} from '../../../../components/LoadingIndicator';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  selectProximityDisclosureDescriptor,
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
  const proximityDisclosureDescriptor = useAppSelector(
    selectProximityDisclosureDescriptor
  );
  const dispatch = useAppDispatch();

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
    }
  }, [proximityStatus, proximityDisclosureDescriptor, navigation]);

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
      {proximityStatus === 'connected' && (
        <VStack space={16} style={IOStyles.alignCenter}>
          <LoadingIndicator size={24} />
          <H6 textStyle={{textAlign: 'center'}}>
            {t('wallet:proximity.connected.body')}
          </H6>
          <VSpacer size={32} />
        </VStack>
      )}
    </View>
  );
};

const MemoizedPresentationProcimityQRCode = memo(PresentationProximityQRCode);

export {MemoizedPresentationProcimityQRCode as PresentationProximityQrCode};
