import {
  IconButton,
  IOColors,
  TabItem,
  TabNavigation
} from '@pagopa/io-app-design-system';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AppState, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainNavigatorParamsList} from '../../../../navigation/main/MainStackNavigator';
import {useQrCodeCameraScanner} from '../hooks/useQrCodeCameraScanner';
import FocusAwareStatusBar from '../../../../components/FocusAwareStatusBar';
import {isAndroid} from '../../../../utils/device';
import {OnBarcodeSuccess, OnBardCodeError} from '../screens/QrCodeScanScreen';
import {useCameraPermissionStatus} from '../hooks/useCameraPermissionStatus';
import {CameraPermissionView} from './CameraPermissionView';

type Props = {
  onBarcodeSuccess: OnBarcodeSuccess;
  onBarcodeError: OnBardCodeError;
  onFileInputPressed: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
};

type NavigationProps = NativeStackNavigationProp<
  MainNavigatorParamsList,
  'MAIN_SCAN_QR'
>;

/**
 * Base screen component for the QR code scanner which renders the camera view, the torch and close buttons and the file input button.
 * @param onBarcodeError - Callback called when a barcode is not successfully decoded
 * @param onBarcodeSuccess - Callback called when a barcode is successfully decoded
 * @param onFileInputPressed - Callback called when the upload file input is pressed, necessary to show the file input modal
 * @param isLoading - If true, the screen goes into a loading state which disables all interaction and displays a loading indicator
 * @param isDisabled - Disables barcode scan capabilities, putting the component in an idle state
 * @returns
 */
const QrCodeScanBaseScreenComponent = ({
  onBarcodeError,
  onBarcodeSuccess,
  onFileInputPressed,
  // onManualInputPressed,
  isLoading = false,
  isDisabled = false
}: Props) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const {t} = useTranslation(['global', 'qrcodeScan']);

  const [isAppInBackground, setIsAppInBackground] = useState(
    AppState.currentState !== 'active'
  );

  /**
   * Updates the app state when it changes.
   *
   * @param {string} nextAppState - The next state of the app.
   *
   * @returns {void}
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setIsAppInBackground(nextAppState !== 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const {cameraPermissionStatus, requestCameraPermission, openCameraSettings} =
    useCameraPermissionStatus();

  const {cameraComponent, hasTorch, isTorchOn, toggleTorch} =
    useQrCodeCameraScanner({
      onBarcodeSuccess,
      onBarcodeError,
      isDisabled: isAppInBackground || !isFocused || isDisabled,
      isLoading
    });

  const cameraView = useMemo(() => {
    if (cameraPermissionStatus === 'granted') {
      return cameraComponent;
    }

    if (cameraPermissionStatus === 'denied') {
      return (
        <CameraPermissionView
          pictogram="cameraDenied"
          title={t('qrcodeScan:permissions.denied.title')}
          body={t('qrcodeScan:permissions.denied.label')}
          action={{
            label: t('qrcodeScan:permissions.denied.action'),
            accessibilityLabel: t('qrcodeScan:permissions.denied.action'),
            onPress: async () => {
              openCameraSettings();
            }
          }}
        />
      );
    }

    return (
      <CameraPermissionView
        pictogram="cameraRequest"
        title={t('qrcodeScan:permissions.undefined.title')}
        body={t('qrcodeScan:permissions.undefined.label')}
        action={{
          label: t('qrcodeScan:permissions.undefined.action'),
          accessibilityLabel: t('qrcodeScan:permissions.undefined.action'),
          onPress: async () => {
            await requestCameraPermission();
          }
        }}
      />
    );
  }, [
    cameraPermissionStatus,
    t,
    cameraComponent,
    requestCameraPermission,
    openCameraSettings
  ]);

  const handleTorchToggle = useCallback(() => {
    toggleTorch();
  }, [toggleTorch]);

  const shouldDisplayTorchButton =
    cameraPermissionStatus === 'granted' && hasTorch;

  const customGoBack = useMemo(
    () => (
      <IconButton
        icon="closeLarge"
        onPress={navigation.goBack}
        accessibilityLabel={t('global:buttons.close')}
        color="contrast"
      />
    ),
    [navigation.goBack, t]
  );

  const torchButton = useMemo(
    () => (
      <IconButton
        icon={isTorchOn ? 'lightFilled' : 'light'}
        accessibilityLabel={t('qrcodeScan:flash')}
        onPress={handleTorchToggle}
        color="contrast"
      />
    ),
    [handleTorchToggle, isTorchOn, t]
  );

  /**
   * Custom header to show the back button and the torch button
   */
  useEffect(() => {
    navigation.setOptions({
      title: '',
      headerShown: true,
      headerTransparent: true,
      headerLeft: () => customGoBack,
      headerRight: () => (shouldDisplayTorchButton ? torchButton : <></>)
    });
  }, [customGoBack, navigation, shouldDisplayTorchButton, torchButton]);

  return (
    <View style={[styles.screen, {paddingBottom: insets.bottom}]}>
      <View style={styles.cameraContainer}>{cameraView}</View>
      <View style={styles.navigationContainer}>
        <TabNavigation tabAlignment="center" selectedIndex={0} color="dark">
          <TabItem
            testID="barcodeScanBaseScreenTabUpload"
            label={t('qrcodeScan:tabs.upload')}
            accessibilityLabel={t('qrcodeScan:tabs.upload')}
            onPress={onFileInputPressed}
          />
        </TabNavigation>
      </View>
      <LinearGradient
        colors={['#03134480', '#03134400']}
        style={styles.headerContainer}>
        <SafeAreaView>
          {/* This overrides BaseHeader status bar configuration */}
          <FocusAwareStatusBar
            barStyle={'light-content'}
            backgroundColor={isAndroid ? IOColors['blueIO-850'] : 'transparent'}
            translucent={false}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IOColors['blueIO-850']
  },
  headerContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: 160
  },
  cameraContainer: {
    flex: 1,
    flexGrow: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  navigationContainer: {
    paddingVertical: 16
  }
});

export {QrCodeScanBaseScreenComponent};
