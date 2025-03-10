import {
  ButtonLink,
  ContentWrapper,
  H2,
  IOPictograms,
  IOStyles,
  IconButton,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import _ from 'lodash';
import * as React from 'react';
import {memo, useCallback, useMemo, useRef} from 'react';
import {
  Alert,
  ColorSchemeName,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {t} from 'i18next';
import {useAppBackgroundAccentColorName} from '../hooks/theme';
import {
  biometricAuthenticationRequest,
  getBiometryIconName
} from '../store/utils/identification';
import {useBiometricType} from '../hooks/useBiometricType';
import {IdentificationNumberPad} from '../components/IdentificationNumberPad';
import {useAppDispatch, useAppSelector} from '../store';
import {selectPin} from '../store/reducers/pin';
import {
  selectIdentificationStatus,
  setIdentificationIdentified,
  setIdentificationUnidentified
} from '../store/reducers/identification';
import {
  preferencesReset,
  selectIsBiometricEnabled
} from '../store/reducers/preferences';
import {isAndroid} from '../utils/device';
import {recordStartupDebugInfo} from '../store/utils/debug';

const onRequestCloseHandler = () => undefined;

/**
 * Identification modal screen which asks for the pin code or biometric authentication.
 * It depends on the status of the identification redux state {@link ts/store/reducers/identification.ts} and can be started by dispatching the setIdentificationStarted action.
 * If the identification is successful, the setIdentificationIdentified action is dispatched, otherwise the setIdentificationUnidentified action is dispatched.
 * The middleware can listen for these actions to perform additional tasks.
 */
const IdentificationModal = () => {
  const showRetryText = useRef(false);
  const headerRef = useRef<View>(null);
  const colorScheme: ColorSchemeName = 'light';
  const numberPadVariant = colorScheme ? 'dark' : 'light';
  const {biometricType} = useBiometricType();
  const pin = useAppSelector(selectPin);
  const dispatch = useAppDispatch();
  const {status, isValidatingTask} = useAppSelector(selectIdentificationStatus);
  const blueColor = useAppBackgroundAccentColorName();
  const {top} = useSafeAreaInsets();
  const isBiometricEnabled = useAppSelector(selectIsBiometricEnabled);
  const topInset = isAndroid ? StatusBar.currentHeight : top;

  const pictogramKey: IOPictograms = isValidatingTask ? 'passcode' : 'key';

  const titleLabel = isValidatingTask
    ? t('identification.title.validation')
    : t('identification.title.access');

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
        () => {
          onIdentificationSuccess();
        },
        e => {
          if (e.name === 'DeviceLocked') {
            Alert.alert(t('global:identification:error:deviceLocked'));
          } else if (e.name === 'DeviceLockedPermanent') {
            Alert.alert(t('global:identification:error:deviceLockedPermanent'));
          }
        }
      ),
    [onIdentificationSuccess]
  );

  const biometricsConfig = useMemo(
    () =>
      biometricType
        ? {
            biometricType,
            biometricAccessibilityLabel: getBiometryIconName(biometricType),
            onBiometricPress: () => onFingerprintRequest()
          }
        : {},
    [biometricType, onFingerprintRequest]
  );

  const onPinValidated = useCallback(
    (isValidated: boolean) => {
      if (isValidated) {
        // eslint-disable-next-line functional/immutable-data
        showRetryText.current = false;
        onIdentificationSuccess();
      } else {
        // eslint-disable-next-line functional/immutable-data
        showRetryText.current = true;
      }
    },
    [onIdentificationSuccess]
  );

  const confirmResetAlert = useCallback(
    () =>
      Alert.alert(
        t('identification.forgot.confirmTitle'),
        t(
          isValidatingTask
            ? 'identification.forgot.confirmMsgWithTask'
            : 'identification.forgot.confirmMsg'
        ),
        [
          {
            text: t('buttons.confirm'),
            style: 'default',
            onPress: onPinResetHandler
          },
          {
            text: t('buttons.cancel'),
            style: 'cancel'
          }
        ],
        {cancelable: false}
      ),
    [isValidatingTask, onPinResetHandler]
  );

  const NumberPad = memo(() =>
    pin ? (
      <IdentificationNumberPad
        pin={pin}
        pinValidation={onPinValidated}
        numberPadVariant={numberPadVariant}
        biometricsConfig={biometricsConfig}
      />
    ) : null
  );

  /*
   * Watching the status variable because it is responsible for the modal popup
   */
  React.useEffect(() => {
    recordStartupDebugInfo({
      identificationModalDisplayStatus: status
    });
  }, [status]);

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
      onRequestClose={onRequestCloseHandler}>
      {Platform.OS === 'ios' && <StatusBar barStyle={'light-content'} />}
      <View style={[styles.contentWrapper, {backgroundColor: blueColor}]}>
        {isValidatingTask && (
          <View accessible style={[styles.closeButton, {marginTop: topInset}]}>
            <ContentWrapper>
              <VSpacer size={16} />
              <IconButton
                icon={'closeLarge'}
                color="contrast"
                onPress={onIdentificationCanceled}
                accessibilityLabel={t('buttons.close')}
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
          ]}>
          <ContentWrapper>
            <View>
              <VSpacer size={16} />
              <View style={IOStyles.alignCenter}>
                <Pictogram
                  pictogramStyle="light-content"
                  name={pictogramKey}
                  size={64}
                />
              </View>
              <View accessible ref={headerRef} style={IOStyles.alignCenter}>
                <VSpacer size={8} />
                <H2 color={'white'} style={{textAlign: 'center'}}>
                  {titleLabel}
                </H2>
              </View>
            </View>
            <VSpacer size={32} />
            <NumberPad />
            <View>
              <VSpacer size={32} />
              <View style={IOStyles.selfCenter}>
                <ButtonLink
                  accessibilityLabel={t('identification.forgot.title')}
                  color="contrast"
                  label={t('identification.forgot.title')}
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
  contentWrapper: {flexGrow: 1},
  closeButton: {
    zIndex: 100,
    flexGrow: 1,
    alignItems: 'flex-end'
  },
  scrollViewContentContainer: {
    flexGrow: 1
  }
});

export default IdentificationModal;
