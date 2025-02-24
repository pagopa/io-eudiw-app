import {useTranslation} from 'react-i18next';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Body,
  ContentWrapper,
  H2,
  LoadingSpinner,
  VSpacer
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetProximity,
  selectProximityError,
  selectProximityQrCode,
  selectProximityState,
  startProximity
} from '../../store/proximity';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';

/**
 * Shows the QR code for the proximity presentation.
 * It also shows the current state of the proximity presentation and a state message.
 */
const ProximityQrCode = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const qrCode = useAppSelector(selectProximityQrCode);
  const error = useAppSelector(selectProximityError);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectProximityState);

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    title: '',
    goBack: () => {
      navigation.goBack();
      dispatch(resetProximity());
    }
  });

  useEffect(() => {
    dispatch(startProximity());
  }, [dispatch]);

  useDebugInfo({qrCode, error});

  return (
    <View>
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
              <Body>{state}</Body>
            </>
          ) : (
            <LoadingSpinner />
          )}
        </View>
      </ContentWrapper>
    </View>
  );
};

export default ProximityQrCode;
