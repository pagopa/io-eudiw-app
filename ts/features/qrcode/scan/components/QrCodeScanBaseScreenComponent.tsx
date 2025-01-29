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
import {CameraPermissionView} from './CameraPermissionView';

type Props = {
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: OnBarcodeSuccess;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: OnBardCodeError;
  /**
   * Callback called when the upload file input is pressed, necessary to show the file input modal
   */
  onFileInputPressed: () => void;
  /**
   * If true, the screen goes into a loading state which disables all interaction and displays a loading indicator
   */
  isLoading?: boolean;
  /**
   * Disables barcode scan capabilities, putting the component in an idle state
   */
  isDisabled?: boolean;
};

type NavigationProps = NativeStackNavigationProp<
  MainNavigatorParamsList,
  'MAIN_SCAN_QR'
>;

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
  const {t} = useTranslation(['global', 'barcodeScan']);

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

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings,
    hasTorch,
    isTorchOn,
    toggleTorch
  } = useQrCodeCameraScanner({
    onBarcodeSuccess,
    onBarcodeError,
    isDisabled: isAppInBackground || !isFocused || isDisabled,
    isLoading
  });

  const openAppSetting = useCallback(async () => {
    // Open the custom settings if the app has one
    await openCameraSettings();
  }, [openCameraSettings]);

  const cameraView = useMemo(() => {
    if (cameraPermissionStatus === 'granted') {
      return cameraComponent;
    }

    if (cameraPermissionStatus === 'not-determined') {
      return (
        <CameraPermissionView
          pictogram="cameraRequest"
          title={t('barcodeScan:permissions.undefined.title')}
          body={t('barcodeScan:permissions.undefined.label')}
          action={{
            label: t('barcodeScan:permissions.undefined.action'),
            accessibilityLabel: t('barcodeScan:permissions.undefined.action'),
            onPress: async () => {
              await requestCameraPermission();
            }
          }}
        />
      );
    }

    return (
      <CameraPermissionView
        pictogram="cameraDenied"
        title={t('barcodeScan:permissions.denied.title')}
        body={t('barcodeScan:permissions.denied.label')}
        action={{
          label: t('barcodeScan:permissions.denied.action'),
          accessibilityLabel: t('barcodeScan:permissions.denied.action'),
          onPress: async () => {
            await openAppSetting();
          }
        }}
      />
    );
  }, [
    cameraPermissionStatus,
    t,
    cameraComponent,
    requestCameraPermission,
    openAppSetting
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
        accessibilityLabel="CHANGE ME"
        onPress={handleTorchToggle}
        color="contrast"
      />
    ),
    [handleTorchToggle, isTorchOn]
  );

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
            label={t('barcodeScan:tabs.upload')}
            accessibilityLabel={t('barcodeScan:tabs.upload')}
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
