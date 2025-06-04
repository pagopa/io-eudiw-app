import {useTranslation} from 'react-i18next';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Body,
  ContentWrapper,
  H2,
  HSpacer,
  HStack,
  IconButton,
  VSpacer
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
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
  const {startFlow, closeFlow, qrCode, logBox} = useProximity();
  const logBoxBs = useProximityLogBoxBs({log: logBox});

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    title: '',
    goBack: async () => {
      navigation.goBack();
      await closeFlow().catch(); // We can ignore errors here as the hook will write a log if an error occurrs
    }
  });

  useEffect(() => {
    startFlow().catch(() => {}); // We can ignore errors here as the hook will write a log if an error occurrs
    return () => {
      closeFlow().catch(() => {}); // We can ignore errors here as the hook will write a log if an error occurrs
    };
  }, [closeFlow, startFlow]);

  return (
    <ContentWrapper>
      <H2>{t('wallet:proximity.showQr.title')}</H2>
      <VSpacer size={16} />
      <Body>{t('wallet:proximity.showQr.body')}</Body>
      <VSpacer size={40} />
      <View style={{alignItems: 'center'}}>
        {qrCode && (
          <>
            <QRCode size={280} value={qrCode} />
            <VSpacer size={24} />
          </>
        )}
        <HStack>
          <IconButton
            icon="reload"
            onPress={startFlow}
            accessibilityLabel={'reload'}
          />
          <HSpacer />
          <IconButton
            icon={'notes'}
            onPress={logBoxBs.present}
            accessibilityLabel={'Show log'}
          />
        </HStack>
      </View>
      {logBoxBs.bottomSheet}
    </ContentWrapper>
  );
};

export default ProximityQrCode;
