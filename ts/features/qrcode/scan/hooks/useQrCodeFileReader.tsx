import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';
import RNQRGenerator from 'rn-qr-generator';
import { OnBarcodeSuccess, OnBardCodeError } from '../screens/QrCodeScanScreen';

type QrCodeFileReader = {
  showImagePicker: () => Promise<void>;
  isLoading: boolean;
};

type QrCodeFileReaderConfiguration = {
  onBarcodeSuccess: OnBarcodeSuccess;
  onBarcodeError: OnBardCodeError;
};

const imageLibraryOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  allowsMultipleSelection: false
};

/**
 * Hook that handles the image picker and the barcode decoding from the selected image.
 * @param onBarcodeError - Callback called when a barcode is not successfully decoded
 * @param onBarcodeSuccess - Callback called when a barcode is successfully decoded
 */
const useQrCodeFileReader = ({
  onBarcodeError,
  onBarcodeSuccess
}: QrCodeFileReaderConfiguration): QrCodeFileReader => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const { t } = useTranslation(['qrcodeScan', 'global']);

  const showPermissionsAlert = useCallback(() => {
    Alert.alert(
      t('qrcodeScan:imagePicker.settingsAlert.title'),
      t('qrcodeScan:imagePicker.settingsAlert.message'),
      [
        { text: t('global:buttons.cancel'), style: 'cancel' },
        {
          text: t('qrcodeScan:imagePicker.settingsAlert.buttonText.enable'),
          onPress: Linking.openSettings
        }
      ],
      { cancelable: false }
    );
  }, [t]);

  const processImage = useCallback(
    async (uri: string) => {
      const response = await RNQRGenerator.detect({ uri });

      if (response.values?.length) {
        onBarcodeSuccess(response.values);
        return;
      }

      throw new Error('NO_BARCODE_FOUND');
    },
    [onBarcodeSuccess]
  );

  const showImagePicker = useCallback(async () => {
    try {
      const currentPermission =
        permissionStatus?.status === ImagePicker.PermissionStatus.GRANTED
          ? permissionStatus
          : await requestPermission();

      if (currentPermission.status !== ImagePicker.PermissionStatus.GRANTED) {
        showPermissionsAlert();
        return;
      }

      setIsLoading(true);
      const result =
        await ImagePicker.launchImageLibraryAsync(imageLibraryOptions);

      if (result.canceled || !result.assets?.[0]?.uri) {
        setIsLoading(false);
        return;
      }

      await processImage(result.assets[0].uri);
    } catch (error) {
      onBarcodeError();
    } finally {
      setIsLoading(false);
    }
  }, [
    permissionStatus,
    requestPermission,
    showPermissionsAlert,
    processImage,
    onBarcodeError
  ]);

  return {
    showImagePicker,
    isLoading
  };
};

export { useQrCodeFileReader };
