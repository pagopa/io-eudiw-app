import {IOToast} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert} from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from 'react-native-haptic-feedback';
import {useQrCodeFileReader} from '../hooks/useQrCodeFileReader';
import {QrCodeScanBaseScreenComponent} from '../components/QrCodeScanBaseScreenComponent';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';

/**
 * Types for callback in case of success or error
 */
export type OnBarcodeSuccess = (barcodes: Array<string>) => void;

export type OnBardCodeError = () => void;

const QrCodeScanScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation('qrcodeScan');

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const handleMultipleResults = () =>
    Alert.alert(
      t('multipleResultsAlert.title'),
      t('multipleResultsAlert.body'),
      [
        {
          text: t(`multipleResultsAlert.action`),
          style: 'default'
        }
      ],
      {cancelable: false}
    );

  const handleSingleResult = (barcode: string) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: 'PRESENTATION_PRE_DEFINITION',
      params: {
        presentationUrl: barcode
      }
    });
  };

  const handleBarcodeSuccess: OnBarcodeSuccess = (barcodes: Array<string>) => {
    if (barcodes.length > 1) {
      handleMultipleResults();
    } else {
      handleSingleResult(barcodes[0]);
    }
  };

  const handleBarcodeError: OnBardCodeError = () => IOToast.error(t('error'));

  const {showImagePicker, isLoading} = useQrCodeFileReader({
    onBarcodeSuccess: handleBarcodeSuccess,
    onBarcodeError: handleBarcodeError
  });

  return (
    <>
      <QrCodeScanBaseScreenComponent
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        isLoading={isLoading}
        isDisabled={isLoading}
        onFileInputPressed={showImagePicker}
      />
    </>
  );
};

export default QrCodeScanScreen;
