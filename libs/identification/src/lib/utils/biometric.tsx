import {
  getTxtNodeKey,
  IOMarkdown,
  isAndroid,
  isIos,
  Renderer
} from '@io-eudiw-app/commons';
import { BiometricsValidType, Body } from '@pagopa/io-app-design-system';
import { TxtParagraphNode } from '@textlint/ast-node-types';
import * as LocalAuthentication from 'expo-local-authentication';
import { View } from 'react-native';

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
 * @param promptMessage - The message to display in the biometric prompt on iOS devices.
 * @returns A promise that resolves to true if biometric enabling is confirmed or not needed, false otherwise.
 */
export const confirmBiometricEnabling = async (promptMessage: string) => {
  try {
    if (isIos) {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: true
      });
      return res.success;
    } else {
      return true;
    }
  } catch {
    return false;
  }
};

/**
 * Get the accessibility label for the biometric icon based on the biometric type.
 * @param biometricType - The biometric type from expo-local-authentication.
 * @param fingerprintLabel - The label to use for fingerprint authentication.
 * @param faceIdLabel - The label to use for facial recognition authentication.
 * @returns The accessibility label as a string.
 */
export const getBiometryAccessibilityLabel = (
  biometricType: LocalAuthentication.AuthenticationType,
  fingerprintLabel: string,
  faceLabel: string
) => {
  switch (biometricType) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return fingerprintLabel;
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
    case LocalAuthentication.AuthenticationType.IRIS:
      return faceLabel;
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

interface BiometricStrings {
  promptMessage: string;
  promptDescription: string;
  cancelLabel: string;
}

/**
 * Perform a biometric authentication request.
 * @param strings - Object containing the localized strings for the UI.
 * @param onSuccess - Callback function to be called on successful authentication.
 * @param onError - Callback function to be called on error.
 */
export const biometricAuthenticationRequest = async (
  strings: BiometricStrings,
  onSuccess: () => void,
  onError: (e?: LocalAuthentication.LocalAuthenticationError) => void
) => {
  try {
    const options: LocalAuthentication.LocalAuthenticationOptions = {
      disableDeviceFallback: true,
      promptMessage: strings.promptMessage,
      ...(isAndroid && {
        cancelLabel: strings.cancelLabel,
        promptDescription: strings.promptDescription
      })
    };

    const res = await LocalAuthentication.authenticateAsync(options);

    if (res.success) {
      onSuccess();
    } else {
      onError(res.error);
    }
  } catch {
    onError();
  }
};

export const IdentificationInstructionsComponent = (props: {
  biometricType: LocalAuthentication.AuthenticationType | undefined;
  isBiometricIdentificationFailed: boolean;
  instructionsUnlockCode: string;
  instructionsFingerprint: string;
  instructionsFaceId: string;
}) => {
  const {
    biometricType,
    isBiometricIdentificationFailed,
    instructionsUnlockCode,
    instructionsFingerprint,
    instructionsFaceId
  } = props;

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
        content={instructionsUnlockCode}
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
            content={instructionsFingerprint}
            rules={generatePragraphRule()}
          />
        </View>
      );
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
    case LocalAuthentication.AuthenticationType.IRIS:
      return (
        <View accessible style={{ flexDirection: 'row' }}>
          <IOMarkdown
            content={instructionsFaceId}
            rules={generatePragraphRule()}
          />
        </View>
      );
    default:
      return instructionComponent;
  }
};
