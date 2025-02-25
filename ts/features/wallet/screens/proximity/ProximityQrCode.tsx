import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Body,
  ContentWrapper,
  H2,
  HSpacer,
  HStack,
  IconButton,
  LoadingSpinner,
  VSpacer
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../../../store';
import {resetProximity} from '../../store/proximity';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useProximity} from '../../hooks/proximity/useProximity';
import useProximityLogBoxBs from '../../hooks/proximity/useProximityLogBottomSheet';

/**
 * Shows the QR code for the proximity presentation.
 * It also shows the current state of the proximity presentation and a state message.
 */
const ProximityQrCode = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const navigation = useNavigation();
  const {initProximity, closeConnection} = useProximity();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const logBoxBs = useProximityLogBoxBs();

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    title: '',
    goBack: async () => {
      navigation.goBack();
      dispatch(resetProximity());
      await closeConnection();
    }
  });

  const startProximity = useCallback(async () => {
    try {
      setQrCode(null);
      dispatch(resetProximity());
      const res = await initProximity();
      setQrCode(res);
    } catch (e) {
      // We can ignore this because the error is already set in the store and the connection is closed inside initProximity.
    }
  }, [dispatch, initProximity]);

  useEffect(() => {
    startProximity()
      .then(() => {})
      .catch(() => {});
  }, [startProximity]);

  useDebugInfo({qrCode});

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
            <HStack>
              <IconButton
                icon="reload"
                onPress={startProximity}
                accessibilityLabel={'reload'}
              />
              <HSpacer />
              <IconButton
                icon={'notes'}
                onPress={logBoxBs.present}
                accessibilityLabel={'Show log'}
              />
            </HStack>
          </>
        ) : (
          <LoadingSpinner />
        )}
      </View>
      {logBoxBs.bottomSheet}
    </ContentWrapper>
  );
};

export default ProximityQrCode;
