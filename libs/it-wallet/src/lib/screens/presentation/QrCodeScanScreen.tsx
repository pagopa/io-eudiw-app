import {
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { IOToast } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from 'react-native-haptic-feedback';
import { parseDeepLink } from '../../utils/parsing';
import { useQrCodeFileReader } from '../../hooks/useQrCodeFileReader';
import { QrCodeScanBaseScreenComponent } from '../../components/QrCodeScanBaseScreenComponent';

/**
 * Types for callback in case of success or error
 */
export type OnBarcodeSuccess = (barcode: Array<string> | string) => void;

export type OnBardCodeError = () => void;

const QrCodeScanScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const handleMultipleResults = () =>
    Alert.alert(
      t('qr.multipleResultsAlert.title', { ns: 'wallet' }),
      t('qr.multipleResultsAlert.body', { ns: 'wallet' }),
      [
        {
          text: t(`qr.multipleResultsAlert.action`, { ns: 'wallet' }),
          style: 'default'
        }
      ],
      { cancelable: false }
    );

  /**
   * Handler for a single barcode result. It validates that the scanned URL is a
   * recognized wallet deep link (presentation or credential offer) and then
   * delegates routing to the centralized deep link handler, which inspects the
   * scheme and dispatches to the appropriate flow.
   * If the URL is not recognized, it shows a toast error.
   * @param barcode - The barcode string to be parsed
   */
  const handleSingleResult = (barcode: string) => {
    try {
      // Validate the scanned URL; routing is performed by the deep link handler.
      parseDeepLink(barcode);
      ReactNativeHapticFeedback.trigger(
        HapticFeedbackTypes.notificationSuccess
      );
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'DEEP_LINK_HANDLER',
        params: {
          url: barcode
        }
      });
    } catch {
      ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationError);
      IOToast.error(t('qr.error', { ns: 'wallet' }));
    }
  };

  const handleBarcodeSuccess: OnBarcodeSuccess = barcode => {
    const codes = Array.isArray(barcode) ? barcode : [barcode];

    if (codes.length > 1) {
      handleMultipleResults();
    } else {
      handleSingleResult(codes[0]);
    }
  };

  const handleBarcodeError: OnBardCodeError = () =>
    IOToast.error(t('qr.error', { ns: 'wallet' }));

  const { showImagePicker, isLoading } = useQrCodeFileReader({
    onBarcodeSuccess: handleBarcodeSuccess,
    onBarcodeError: handleBarcodeError
  });

  return (
    <QrCodeScanBaseScreenComponent
      onBarcodeSuccess={handleBarcodeSuccess}
      isLoading={isLoading}
      isDisabled={isLoading}
      onFileInputPressed={showImagePicker}
    />
  );
};

export default QrCodeScanScreen;
