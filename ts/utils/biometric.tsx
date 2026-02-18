import { BiometricsValidType, Body } from '@pagopa/io-app-design-system';
import { TxtParagraphNode } from '@textlint/ast-node-types';
import * as LocalAuthentication from 'expo-local-authentication';
import { t } from 'i18next';
import { View } from 'react-native';
import IOMarkdown from '../components/IOMarkdown';
import { getTxtNodeKey } from '../components/IOMarkdown/renderRules';
import { Renderer } from '../components/IOMarkdown/types';
import { isAndroid, isIos } from './device';

/**
 * Simplified biometric state representation.
 */
export type BiometricState = 'AVAILABLE' | 'NOT_ENROLLED' | 'NOT_SUPPORTED';

/**
 * Get the biometric state of the device.
 * @returns A promise that resolves to the biometric state based on BiometricState type.
 */
export const getBiometricState = async (): Promise<BiometricState> => {
  const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
  if (!isBiometricSupported) {
    return 'NOT_SUPPORTED';
  }
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return 'NOT_ENROLLED';
  }
  return 'AVAILABLE';
};

/**
 * On iOS devices, prompts the user to confirm biometric enabling.
 * If the device is Android, it directly returns true.
 * @returns A promise that resolves to true if biometric enabling is confirmed or not needed, false otherwise.
 */
export const confirmBiometricEnabling = async () => {
  try {
    if (isIos) {
      const promptMessage = t('identification.biometric.sensorDescription', {
        ns: 'global'
      });
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: true
      });
      return res.success;
    } else {
      return true;
    }
  } catch (e) {
    return false;
  }
};

/**
 * Get the design system icon name for the given biometric type.
 * @param biometricType - The biometric type from expo-local-authentication.
 * @returns The design system icon name as a string.
 */
export const getBiometryDesignSystemIconName = (
  biometricType: LocalAuthentication.AuthenticationType
) => {
  switch (biometricType) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return t('identification.unlockCode.accessibility.fingerprint', {
        ns: 'global'
      });
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
    case LocalAuthentication.AuthenticationType.IRIS:
      return t('identification.unlockCode.accessibility.faceId', {
        ns: 'global'
      });
  }
};

/**
 * Get the design system biometric type for the given biometric type.
 * @param biometricType - The biometric type from expo-local-authentication.
 * @returns The design system biometric type as BiometricsValidType.
 */
export const getBiometricDesignSystemType = (
  biometricType: LocalAuthentication.AuthenticationType
): BiometricsValidType => {
  switch (biometricType) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'TOUCH_ID';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'FACE_ID'; // Equals to 'BIOMETRICS' in IO design system as they both map to the same icon
  }
};

/**
 * Perform a biometric authentication request.
 * @param onSuccess - Callback function to be called on successful authentication.
 * @param onError - Callback function to be called on authentication error, with an optional error parameter matching LocalAuthenticationError.
 */
export const biometricAuthenticationRequest = async (
  onSuccess: () => void,
  onError: (e?: LocalAuthentication.LocalAuthenticationError) => void
) => {
  try {
    const options: LocalAuthentication.LocalAuthenticationOptions = {
      disableDeviceFallback: true,
      promptMessage: isAndroid
        ? t('identification.biometric.title', { ns: 'global' })
        : t('identification.biometric.sensorDescription', {
            ns: 'global'
          }),
      ...(isAndroid
        ? {
            cancelLabel: t('buttons.cancel', { ns: 'global' }),
            promptDescription: t('identification.biometric.sensorDescription', {
              ns: 'global'
            })
          }
        : {})
    };

    const res = await LocalAuthentication.authenticateAsync(options);
    if (res.success) {
      onSuccess();
    } else {
      onError(res.error);
    }
  } catch (error) {
    onError();
  }
};

export const IdentificationInstructionsComponent = (props: {
  biometricType: LocalAuthentication.AuthenticationType | undefined;
  isBiometricIdentificationFailed: boolean;
}) => {
  const { biometricType, isBiometricIdentificationFailed } = props;

  const generatePragraphRule = () => ({
    Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
      return (
        <Body
          key={getTxtNodeKey(paragraph)}
          color="white"
          style={{ textAlign: 'center' }}
        >
          {paragraph.children.map(render)}
        </Body>
      );
    }
  });

  const instructionComponent = (
    <View accessible style={{ flexDirection: 'row' }}>
      <IOMarkdown
        content={t('identification.instructions.useUnlockCode', {
          ns: 'global'
        })}
        rules={generatePragraphRule()}
      />
    </View>
  );

  if (isBiometricIdentificationFailed) {
    return instructionComponent;
  }

  switch (biometricType) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return (
        <View accessible style={{ flexDirection: 'row' }}>
          <IOMarkdown
            content={t(
              'identification.instructions.useFingerPrintOrUnlockCode'
            )}
            rules={generatePragraphRule()}
          />
        </View>
      );
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
    case LocalAuthentication.AuthenticationType.IRIS:
      return (
        <View accessible style={{ flexDirection: 'row' }}>
          <IOMarkdown
            content={t('identification.instructions.useFaceIdOrUnlockCode', {
              ns: 'global'
            })}
            rules={generatePragraphRule()}
          />
        </View>
      );
    default:
      return instructionComponent;
  }
};
