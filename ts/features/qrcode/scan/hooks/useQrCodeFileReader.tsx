import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary
} from 'react-native-image-picker';
import {useState} from 'react';
import {Alert, Linking} from 'react-native';
import RNQRGenerator from 'rn-qr-generator';
import {useTranslation} from 'react-i18next';
import {OnBarcodeSuccess, OnBardCodeError} from '../screens/QrCodeScanScreen';

type QrCodeFileReader = {
  /**
   * Shows the image picker that lets the user select an image from the library
   */
  showImagePicker: () => void;
  /**
   * Indicates that the decoder is currently reading/decoding barcodes
   */
  isLoading: boolean;
};

type QrCodeFileReaderConfiguration = {
  /**
   * Callback called when there is at least one barcode being successfully decoded
   */
  onBarcodeSuccess: OnBarcodeSuccess;

  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: OnBardCodeError;
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  includeBase64: true,
  selectionLimit: 1
};

const useQrCodeFileReader = ({
  onBarcodeError,
  onBarcodeSuccess
}: QrCodeFileReaderConfiguration): QrCodeFileReader => {
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation(['qrcodeScan', 'global']);

  const handleBarcodeSuccess = (barcodes: Array<string>) => {
    setIsLoading(false);
    onBarcodeSuccess(barcodes);
  };

  const handleBarcodeError = () => {
    setIsLoading(false);
    onBarcodeError();
  };

  /**
   * Handles the selected image from the image picker and pass the asset to the {@link qrCodeFromImageTask} task
   */
  const onImageSelected = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      setIsLoading(false);
      return;
    }

    if (response.errorCode) {
      Alert.alert(
        t('qrcodeScan:imagePicker.settingsAlert.title'),
        t('qrcodeScan:imagePicker.settingsAlert.message'),
        [
          {
            text: t('global:buttons.cancel'),
            style: 'cancel'
          },
          {
            text: t('qrcodeScan:imagePicker.settingsAlert.buttonText.enable'),
            onPress: Linking.openSettings
          }
        ],
        {cancelable: false}
      );
      return;
    }

    setIsLoading(true);

    // We check only for the first one because we are using selectionLimit: 1
    if (!response.assets || !response.assets[0] || !response.assets[0].base64) {
      handleBarcodeError();
      return;
    }

    const base64 = response.assets[0].base64;

    try {
      const result = await RNQRGenerator.detect({base64});
      if (result.values.length === 0) {
        handleBarcodeError();
      } else {
        handleBarcodeSuccess(result.values);
      }
    } catch {
      handleBarcodeError();
    }
  };

  const showImagePicker = async () => {
    setIsLoading(true);

    void launchImageLibrary(imageLibraryOptions, onImageSelected);
  };

  return {
    showImagePicker,
    isLoading
  };
};

export {useQrCodeFileReader};
