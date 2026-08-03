import {
  isAndroid,
  useAppBackgroundAccentColorName
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  selectIsBiometricEnabled
} from '@io-eudiw-app/preferences';
import {
  ContentWrapper,
  H2,
  IconButton,
  IOButton,
  IOPictograms,
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
import { useAppDispatch, useAppSelector } from '../reducer';
import {
  selectIdentificationStatus,
  setIdentificationIdentified,
  setIdentificationUnidentified
} from '../reducer/identification';
import { selectPin } from '../reducer/pin';
import {
  biometricAuthenticationRequest,
  getBiometricDesignSystemType,
  getBiometryAccessibilityLabel,
  IdentificationInstructionsComponent
} from '../utils/biometric';
import { IdentificationNumberPad } from './IdentificationNumberPad';

const onRequestCloseHandler = () => undefined;

type IdentificationModalProps = {
  biometricLabels: {
    cancelLabel: string;
    promptDescription: string;
    promptMessage: string;
  };
  closeAccessibilityLabel: string;
  deleteAccessibilityLabel: string;
  faceAccessibilityLabel: string;
  fingerprintAccessibilityLabel: string;
  instructionsLabels: {
    faceId: string;
    fingerprint: string;
    unlockCode: string;
  };
  resetLabels: {
    cancelButton: string;
    confirmButton: string;
    confirmMsg: string;
    confirmMsgWithTask: string;
    forgotButton: string;
    title: string;
  };
  titleLabels: {
    access: string;
    validation: string;
  };
};

/**
 * Identification modal screen which asks for the pin code or biometric authentication.
 * It depends on the status of the identification redux state {@link ts/store/reducers/identification.ts} and can be started by dispatching the setIdentificationStarted action.
 * If the identification is successful, the setIdentificationIdentified action is dispatched, otherwise the setIdentificationUnidentified action is dispatched.
 * The middleware can listen for these actions to perform additional tasks.
 */
// eslint-disable-next-line max-lines-per-function
export const IdentificationModal = ({
  biometricLabels,
  closeAccessibilityLabel,
  deleteAccessibilityLabel,
  faceAccessibilityLabel,
  fingerprintAccessibilityLabel,
  instructionsLabels,
  resetLabels,
  titleLabels
}: IdentificationModalProps) => {
  const showRetryText = useRef(false);
  const headerRef = useRef<View>(null);
  const colorScheme: ColorSchemeName = 'light';
  const numberPadVariant = colorScheme ? 'primary' : 'neutral';
  const { biometricType } = useBiometricType();
  const pin = useAppSelector(selectPin);
  const dispatch = useAppDispatch();
  const { isValidatingTask, status } = useAppSelector(
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
          cancelLabel: biometricLabels.cancelLabel,
          promptDescription: biometricLabels.promptDescription,
          promptMessage: biometricLabels.promptMessage
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
            biometricAccessibilityLabel: getBiometryAccessibilityLabel(
              biometricType,
              fingerprintAccessibilityLabel,
              faceAccessibilityLabel
            ),
            biometricType: getBiometricDesignSystemType(biometricType),
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
            onPress: onPinResetHandler,
            style: 'default',
            text: resetLabels.confirmButton
          },
          {
            style: 'cancel',
            text: resetLabels.cancelButton
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
        biometricsConfig={biometricsConfig}
        deleteAccessibilityLabel={deleteAccessibilityLabel}
        numberPadVariant={numberPadVariant}
        pin={pin}
        pinValidation={onPinValidated}
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
      onRequestClose={onRequestCloseHandler}
      statusBarTranslucent
      transparent
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
                accessibilityLabel={closeAccessibilityLabel}
                color="contrast"
                icon={'closeLarge'}
                onPress={onIdentificationCanceled}
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
                  name={pictogramKey}
                  pictogramStyle="light-content"
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
                  instructionsFaceId={instructionsLabels.faceId}
                  instructionsFingerprint={instructionsLabels.fingerprint}
                  instructionsUnlockCode={instructionsLabels.unlockCode}
                  isBiometricIdentificationFailed={isBiometricLocked}
                />
              </View>
            </View>
            <VSpacer size={32} />
            <NumberPad />
            <View>
              <VSpacer size={32} />
              <View style={{ alignSelf: 'center' }}>
                <IOButton
                  accessibilityLabel={resetLabels.forgotButton}
                  color="contrast"
                  label={resetLabels.forgotButton}
                  onPress={() => confirmResetAlert()}
                  variant="link"
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
  closeButton: {
    alignItems: 'flex-end',
    flexGrow: 1,
    zIndex: 100
  },
  contentWrapper: { flexGrow: 1 },
  scrollViewContentContainer: {
    flexGrow: 1
  }
});
