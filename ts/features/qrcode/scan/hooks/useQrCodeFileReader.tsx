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
  quality: 1,
  allowsMultipleSelection: false,
  base64: true
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

  const processBase64 = useCallback(
    async (base64: string) => {
      try {
        const response = await RNQRGenerator.detect({ base64 });

        if (response.values && response.values.length > 0) {
          onBarcodeSuccess(response.values);
        } else {
          onBarcodeError();
        }
      } catch (error) {
        onBarcodeError();
      } finally {
        setIsLoading(false);
      }
    },
    [onBarcodeSuccess, onBarcodeError]
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

      if (result.canceled || !result.assets?.[0]?.base64) {
        setIsLoading(false);
        return;
      }

      await processBase64(result.assets[0].base64);
    } catch (error) {
      setIsLoading(false);
      onBarcodeError();
    }
  }, [
    permissionStatus,
    requestPermission,
    showPermissionsAlert,
    processBase64,
    onBarcodeError
  ]);

  return {
    showImagePicker,
    isLoading
  };
};

export { useQrCodeFileReader };
