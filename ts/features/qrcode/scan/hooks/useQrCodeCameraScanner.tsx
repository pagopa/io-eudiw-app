import {IOColors, LoadingSpinner} from '@pagopa/io-app-design-system';

import {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner
} from 'react-native-vision-camera';

import {usePrevious} from '../../../../hooks/usePrevious';
import {AnimatedCameraMarker} from '../components/AnimatedCameraMarker';
import {OnBarcodeSuccess, OnBardCodeError} from '../screens/QrCodeScanScreen';

/**
 * {@link useQrCodeCameraScanner} configuration
 */
export type QrCodeCameraScannerConfiguration = {
  onBarcodeSuccess: OnBarcodeSuccess;
  onBarcodeError: OnBardCodeError;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export type QrCodeCameraScanner = {
  /**
   * Component that renders the camera
   */
  cameraComponent: ReactNode;
  /**
   * Returns true if the device has a torch
   */
  hasTorch: boolean;
  /**
   * Returns true if the torch is on
   */
  isTorchOn: boolean;
  /**
   * Toggles the torch states between "on" and "off"
   */
  toggleTorch: () => void;
};

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 5000;

/**
 * This hook handles the camera scanner for QR codes.
 * @param onBarcodeSuccess - Callback called when a barcode is successfully decoded
 * @param onBarcodeError - Callback called when a barcode is not successfully decoded
 * @param isDisabled - Disables the barcode scanner
 * @param isLoading - If true, the component displays a loading indicator and disables all interactions
 */
export const useQrCodeCameraScanner = ({
  onBarcodeSuccess,
  onBarcodeError,
  isDisabled,
  isLoading = false
}: // eslint-disable-next-line sonarjs/cognitive-complexity
QrCodeCameraScannerConfiguration): QrCodeCameraScanner => {
  const prevDisabled = usePrevious(isDisabled);
  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera']
  });

  // Checks that the device has a torch
  const hasTorch = !!device?.hasTorch;
  const [isTorchOn, setTorchOn] = useState<boolean>(false);

  // This handles the resting state of the scanner after a scan
  // It is necessary to avoid multiple scans of the same barcode
  const scannerReactivateTimeoutHandler =
    useRef<ReturnType<typeof setTimeout>>(null);
  const [isResting, setIsResting] = useState(false);

  /**
   * Handles the scanned barcodes and calls the callbacks for the results
   */
  const handleScannedBarcodes = useCallback(
    (codes: Array<Code>) => {
      // This will fix a bug on lower-end devices
      // in which the latest frame would be scanned
      // multiple times due to races conditions during
      // the camera disactivation.
      if (prevDisabled || isDisabled) {
        return;
      }

      if (isResting || isLoading) {
        // Barcode scanner is momentarily disabled, skip
        return;
      }
      // After a scan (even if not successful) the decoding is disabled for a while
      // to avoid multiple scans of the same barcode
      setIsResting(true);
      // eslint-disable-next-line functional/immutable-data
      scannerReactivateTimeoutHandler.current = setTimeout(() => {
        setIsResting(false);
      }, QRCODE_SCANNER_REACTIVATION_TIME_MS);

      const stringResult = codes
        .map(item => item.value)
        .filter((value): value is string => value !== undefined); // Typescript can't infer the filter type outside the arrow function

      if (stringResult.length > 0) {
        onBarcodeSuccess(stringResult);
      } else {
        onBarcodeError();
      }
    },
    [
      prevDisabled,
      isDisabled,
      isResting,
      isLoading,
      onBarcodeSuccess,
      onBarcodeError
    ]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleScannedBarcodes
  });

  /**
   * Hook that clears the timeout handler on unmount
   */
  useEffect(
    () => () => {
      if (scannerReactivateTimeoutHandler.current) {
        clearTimeout(scannerReactivateTimeoutHandler.current);
      }
    },
    [scannerReactivateTimeoutHandler]
  );

  /**
   * Component that renders camera and marker
   */
  const cameraComponent = (
    <View style={styles.cameraContainer} testID="BarcodeScannerCameraTestID">
      {device && (
        <Camera
          style={styles.camera}
          device={device}
          audio={false}
          codeScanner={codeScanner}
          isActive={!isDisabled}
          torch={isTorchOn ? 'on' : 'off'}
        />
      )}
      {!isLoading ? (
        <View style={styles.markerContainer}>
          <AnimatedCameraMarker isAnimated={!isResting && !isDisabled} />
        </View>
      ) : (
        <View style={styles.markerContainer}>
          <LoadingMarkerComponent />
        </View>
      )}
    </View>
  );

  const toggleTorch = () => setTorchOn(prev => !prev);

  return {
    cameraComponent,
    hasTorch,
    isTorchOn,
    toggleTorch
  };
};

const LoadingMarkerComponent = () => (
  <Animated.View
    entering={FadeIn}
    style={{flex: 1, justifyContent: 'center', marginTop: '15%'}}>
    <LoadingSpinner size={76} color="white" />
  </Animated.View>
);

const styles = StyleSheet.create({
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: IOColors.black
  },
  camera: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  markerContainer: {
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0
  }
});
