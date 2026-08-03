import { FocusAwareStatusBar, isAndroid } from '@io-eudiw-app/commons';
import {
  IconButton,
  IOColors,
  TabItem,
  TabNavigation
} from '@pagopa/io-app-design-system';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';

import { useCameraPermissionStatus } from '../hooks/useCameraPermissionStatus';
import { useQrCodeCameraScanner } from '../hooks/useQrCodeCameraScanner';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import { OnBarcodeSuccess } from '../screens/presentation/QrCodeScanScreen';
import { CameraPermissionView } from './CameraPermissionView';

type NavigationProps = StackNavigationProp<
  MainNavigatorParamsList,
  'MAIN_SCAN_QR'
>;

type Props = {
  isDisabled?: boolean;
  isLoading?: boolean;
  onBarcodeSuccess: OnBarcodeSuccess;
  onFileInputPressed: () => void;
};

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
  isDisabled = false,
  // onManualInputPressed,
  isLoading = false,
  onBarcodeSuccess,
  onFileInputPressed
}: Props) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const { t } = useTranslation(['common', 'wallet']);

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

  const { cameraPermissionStatus, openCameraSettings, requestPermission } =
    useCameraPermissionStatus();

  const { cameraComponent, enableTorch, toggleTorch } = useQrCodeCameraScanner({
    isDisabled: isAppInBackground || !isFocused || isDisabled,
    isLoading,
    onBarcodeSuccess
  });

  const shouldDisplayTorchButton = cameraPermissionStatus === 'granted';

  const cameraView = useMemo(() => {
    if (cameraPermissionStatus === 'granted') {
      return cameraComponent;
    }

    if (cameraPermissionStatus === 'denied') {
      return (
        <CameraPermissionView
          action={{
            accessibilityLabel: t('wallet:qr.permissions.denied.action'),
            label: t('wallet:qr.permissions.denied.action'),
            onPress: async () => {
              openCameraSettings();
            }
          }}
          body={t('wallet:qr.permissions.denied.label')}
          pictogram="cameraDenied"
          title={t('wallet:qr.permissions.denied.title')}
        />
      );
    }

    return (
      <CameraPermissionView
        action={{
          accessibilityLabel: t('wallet:qr.permissions.undefined.action'),
          label: t('wallet:qr.permissions.undefined.action'),
          onPress: async () => {
            await requestPermission();
          }
        }}
        body={t('wallet:qr.permissions.undefined.label')}
        pictogram="cameraRequest"
        title={t('wallet:qr.permissions.undefined.title')}
      />
    );
  }, [
    cameraPermissionStatus,
    t,
    cameraComponent,
    requestPermission,
    openCameraSettings
  ]);

  const handleTorchToggle = useCallback(() => {
    toggleTorch();
  }, [toggleTorch]);

  const customGoBack = useMemo(
    () => (
      <View style={styles.goBack}>
        <IconButton
          accessibilityLabel={t('common:buttons.close')}
          color="contrast"
          icon="closeLarge"
          onPress={navigation.goBack}
        />
      </View>
    ),
    [navigation.goBack, t]
  );

  const torchButton = useMemo(
    () => (
      <View style={styles.torch}>
        <IconButton
          accessibilityLabel={t('wallet:qr.flash')}
          color="contrast"
          icon={enableTorch ? 'lightFilled' : 'light'}
          onPress={handleTorchToggle}
        />
      </View>
    ),
    [enableTorch, handleTorchToggle, t]
  );

  /**
   * Custom header to show the back button and the torch button
   */
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => customGoBack,
      headerRight: () => (shouldDisplayTorchButton ? torchButton : null),
      headerShown: true,
      headerTransparent: true,
      title: ''
    });
  }, [customGoBack, navigation, shouldDisplayTorchButton, torchButton]);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.cameraContainer}>{cameraView}</View>
      <View style={styles.navigationContainer}>
        <TabNavigation color="dark" selectedIndex={0} tabAlignment="center">
          <TabItem
            accessibilityLabel={t('wallet:qr.tabs.upload')}
            label={t('wallet:qr.tabs.upload')}
            onPress={onFileInputPressed}
            testID="barcodeScanBaseScreenTabUpload"
          />
        </TabNavigation>
      </View>
      <LinearGradient
        colors={['#03134480', '#03134400']}
        style={styles.headerContainer}
      >
        <SafeAreaView>
          {/* This overrides BaseHeader status bar configuration */}
          <FocusAwareStatusBar
            backgroundColor={isAndroid ? IOColors['blueIO-850'] : 'transparent'}
            barStyle={'light-content'}
            translucent={false}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  goBack: {
    marginLeft: 24
  },
  headerContainer: {
    flex: 1,
    height: 160,
    position: 'absolute',
    width: '100%'
  },
  navigationContainer: {
    paddingVertical: 16
  },
  screen: {
    backgroundColor: IOColors['blueIO-850'],
    flex: 1
  },
  torch: {
    marginRight: 24
  }
});

export { QrCodeScanBaseScreenComponent };
