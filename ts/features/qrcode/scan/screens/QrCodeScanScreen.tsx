import {IOToast} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert} from 'react-native';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useQrCodeFileReader} from '../hooks/useQrCodeFileReader';
import {QrCodeScanBaseScreenComponent} from '../components/QrCodeScanBaseScreenComponent';

/**
 * Types for callback in case of success or error
 */
export type OnBarcodeSuccess = (barcodes: Array<string>) => void;

export type OnBardCodeError = () => void;

const QrCodeScanScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation('barcodeScan');

  useHardwareBackButton(() => {
    navigation.goBack();
    return true;
  });

  const handleBarcodeSuccess: OnBarcodeSuccess = (barcodes: Array<string>) => {
    if (barcodes.length > 1) {
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

export {QrCodeScanScreen};
