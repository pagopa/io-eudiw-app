import {
  ContentWrapper,
  H2,
  IOButton,
  IOPictograms,
  IconButton,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ColorSchemeName,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBiometricType } from '../hooks/useBiometricType';
import {
  selectIdentificationStatus,
  setIdentificationIdentified,
  setIdentificationUnidentified
} from '../reducer/identification';
import {
  biometricAuthenticationRequest,
  getBiometricDesignSystemType,
  getBiometryAccessibilityLabel,
  IdentificationInstructionsComponent
} from '../utils/biometric';
import {
  isAndroid,
  useAppBackgroundAccentColorName
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  selectIsBiometricEnabled
} from '@io-eudiw-app/preferences';
import { IdentificationNumberPad } from './IdentificationNumberPad';
import { useAppDispatch, useAppSelector } from '../reducer';
import { selectPin } from '../reducer/pin';

const onRequestCloseHandler = () => undefined;

type IdentificationModalProps = {
  titleLabels: {
    validation: string;
    access: string;
  };
  biometricLabels: {
    promptMessage: string;
    promptDescription: string;
    cancelLabel: string;
  };
  instructionsLabels: {
    unlockCode: string;
    fingerprint: string;
    faceId: string;
  };
  resetLabels: {
    forgotButton: string;
    title: string;
    confirmMsg: string;
    confirmMsgWithTask: string;
    confirmButton: string;
    cancelButton: string;
  };
  closeAccessibilityLabel: string;
  deleteAccessibilityLabel: string;
  fingerprintAccessibilityLabel: string;
  faceAccessibilityLabel: string;
};

/**
 * Identification modal screen which asks for the pin code or biometric authentication.
 * It depends on the status of the identification redux state {@link ts/store/reducers/identification.ts} and can be started by dispatching the setIdentificationStarted action.
 * If the identification is successful, the setIdentificationIdentified action is dispatched, otherwise the setIdentificationUnidentified action is dispatched.
 * The middleware can listen for these actions to perform additional tasks.
 */
export const IdentificationModal = ({
  titleLabels,
  biometricLabels,
  instructionsLabels,
  resetLabels,
  deleteAccessibilityLabel,
  fingerprintAccessibilityLabel,
  faceAccessibilityLabel,
  closeAccessibilityLabel
}: IdentificationModalProps) => {
  const showRetryText = useRef(false);
  const headerRef = useRef<View>(null);
  const colorScheme: ColorSchemeName = 'light';
  const numberPadVariant = colorScheme ? 'primary' : 'neutral';
  const { biometricType } = useBiometricType();
  const pin = useAppSelector(selectPin);
  const dispatch = useAppDispatch();
  const { status, isValidatingTask } = useAppSelector(
    selectIdentificationStatus
  );
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const blueColor = useAppBackgroundAccentColorName();
  const { top } = useSafeAreaInsets();
  const isBiometricEnabled = useAppSelector(selectIsBiometricEnabled);
  const topInset = isAndroid ? StatusBar.currentHeight : top;

  const pictogramKey: IOPictograms = isValidatingTask ? 'passcode' : 'key';

  const titleLabel = isValidatingTask
    ? titleLabels.validation
    : titleLabels.access;

  const onIdentificationCanceled = useCallback(() => {
    dispatch(setIdentificationUnidentified());
  }, [dispatch]);

  const onIdentificationSuccess = useCallback(() => {
    dispatch(setIdentificationIdentified());
  }, [dispatch]);

  const onPinResetHandler = useCallback(() => {
    dispatch(preferencesReset());
  }, [dispatch]);

  const onFingerprintRequest = useCallback(
    () =>
      biometricAuthenticationRequest(
        {
          promptMessage: biometricLabels.promptMessage,
          promptDescription: biometricLabels.promptDescription,
          cancelLabel: biometricLabels.cancelLabel
        },
        () => {
          onIdentificationSuccess();
        },
        e => {
          if (!e) {
            return;
          }
          if (e === 'lockout') {
            setIsBiometricLocked(true);
          }
        }
      ),
    [
      biometricLabels.cancelLabel,
      biometricLabels.promptDescription,
      biometricLabels.promptMessage,
      onIdentificationSuccess
    ]
  );

  const biometricsConfig = useMemo(
    () =>
      biometricType
        ? {
            biometricType: getBiometricDesignSystemType(biometricType),
            biometricAccessibilityLabel: getBiometryAccessibilityLabel(
              biometricType,
              fingerprintAccessibilityLabel,
              faceAccessibilityLabel
            ),
            onBiometricPress: () => onFingerprintRequest()
          }
        : {},
    [
      biometricType,
      onFingerprintRequest,
      fingerprintAccessibilityLabel,
      faceAccessibilityLabel
    ]
  );

  const onPinValidated = useCallback(
    (isValidated: boolean) => {
      if (isValidated) {
        showRetryText.current = false;
        onIdentificationSuccess();
      } else {
        showRetryText.current = true;
      }
    },
    [onIdentificationSuccess]
  );

  const confirmResetAlert = useCallback(
    () =>
      Alert.alert(
        resetLabels.title,
        isValidatingTask
          ? resetLabels.confirmMsgWithTask
          : resetLabels.confirmMsg,
        [
          {
            text: resetLabels.confirmButton,
            style: 'default',
            onPress: onPinResetHandler
          },
          {
            text: resetLabels.cancelButton,
            style: 'cancel'
          }
        ],
        { cancelable: false }
      ),
    [
      isValidatingTask,
      onPinResetHandler,
      resetLabels.cancelButton,
      resetLabels.confirmButton,
      resetLabels.confirmMsg,
      resetLabels.confirmMsgWithTask,
      resetLabels.title
    ]
  );

  const NumberPad = memo(() =>
    pin ? (
      <IdentificationNumberPad
        pin={pin}
        pinValidation={onPinValidated}
        numberPadVariant={numberPadVariant}
        biometricsConfig={biometricsConfig}
        deleteAccessibilityLabel={deleteAccessibilityLabel}
      />
    ) : null
  );

  // If the authentication process is not started, we don't show the modal.
  // We need to put this before the biometric request,
  // to avoid the biometric request to be triggered when the modal is not shown.
  if (status !== 'started') {
    return null;
  }
  /**
   * Shows the biometric request if the biometric is enabled.
   */
  if (isBiometricEnabled) {
    void onFingerprintRequest();
  }

  return (
    <Modal
      statusBarTranslucent
      transparent
      onRequestClose={onRequestCloseHandler}
    >
      {Platform.OS === 'ios' && <StatusBar barStyle={'light-content'} />}
      <View style={[styles.contentWrapper, { backgroundColor: blueColor }]}>
        {isValidatingTask && (
          <View
            accessible
            style={[styles.closeButton, { marginTop: topInset }]}
          >
            <ContentWrapper>
              <VSpacer size={16} />
              <IconButton
                icon={'closeLarge'}
                color="contrast"
                onPress={onIdentificationCanceled}
                accessibilityLabel={closeAccessibilityLabel}
              />
            </ContentWrapper>
          </View>
        )}
        <ScrollView
          centerContent={true}
          contentContainerStyle={[
            styles.scrollViewContentContainer,
            {
              justifyContent: isValidatingTask ? undefined : 'center'
            }
          ]}
        >
          <ContentWrapper>
            <View>
              <VSpacer size={16} />
              <View style={{ alignItems: 'center' }}>
                <Pictogram
                  pictogramStyle="light-content"
                  name={pictogramKey}
                  size={64}
                />
              </View>
              <View accessible ref={headerRef} style={{ alignItems: 'center' }}>
                <VSpacer size={8} />
                <H2 color={'white'} style={{ textAlign: 'center' }}>
                  {titleLabel}
                </H2>
                <VSpacer size={8} />

                <IdentificationInstructionsComponent
                  biometricType={biometricType}
                  isBiometricIdentificationFailed={isBiometricLocked}
                  instructionsUnlockCode={instructionsLabels.unlockCode}
                  instructionsFingerprint={instructionsLabels.fingerprint}
                  instructionsFaceId={instructionsLabels.faceId}
                />
              </View>
            </View>
            <VSpacer size={32} />
            <NumberPad />
            <View>
              <VSpacer size={32} />
              <View style={{ alignSelf: 'center' }}>
                <IOButton
                  variant="link"
                  accessibilityLabel={resetLabels.forgotButton}
                  color="contrast"
                  label={resetLabels.forgotButton}
                  onPress={() => confirmResetAlert()}
                />
                <VSpacer size={16} />
              </View>
            </View>
          </ContentWrapper>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentWrapper: { flexGrow: 1 },
  closeButton: {
    zIndex: 100,
    flexGrow: 1,
    alignItems: 'flex-end'
  },
  scrollViewContentContainer: {
    flexGrow: 1
  }
});
