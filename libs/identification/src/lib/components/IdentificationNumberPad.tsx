import { isDevEnv } from '@io-eudiw-app/commons';
import {
  BiometricsValidType,
  CodeInput,
  IconButton,
  NumberPad,
  VSpacer
} from '@pagopa/io-app-design-system';
import { NumberButton } from '@pagopa/io-app-design-system/lib/typescript/components/numberpad/NumberButton';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const PIN_LENGTH = 6;
const CODE_INPUT_ERROR_ANIMATION_DURATION = 500;
const CODE_INPUT_SUCCESS_CALLBACK_CALL_TIMEOUT = 250;

type BiometricConfigType =
  | {
      biometricAccessibilityLabel: string;
      biometricType: BiometricsValidType;
      onBiometricPress: () => Promise<void>;
    }
  | {
      biometricAccessibilityLabel?: undefined;
      biometricType?: undefined;
      onBiometricPress?: undefined;
    };
type IdentificationNumberPadProps = {
  biometricsConfig: BiometricConfigType;
  deleteAccessibilityLabel: string;
  numberPadVariant: React.ComponentProps<typeof NumberButton>['variant'];
  pin: string;
  pinValidation: (success: boolean) => void;
};

/**
 * Number pad for identification screen which allows to insert a pin code.
 * It also shows an error animation if the pin is not correct.
 * If the environment is development, a button to automatically insert the correct pin is shown.
 */
export const IdentificationNumberPad = (
  props: IdentificationNumberPadProps
) => {
  const [value, setValue] = useState('');

  const {
    biometricsConfig,
    deleteAccessibilityLabel,
    numberPadVariant,
    pin,
    pinValidation
  } = props;

  const onValueChange = useCallback((v: number) => {
    setValue(prev => (prev.length < PIN_LENGTH ? `${prev}${v}` : prev));
  }, []);

  const onDeletePress = useCallback(() => {
    setValue((prev: string) => prev.slice(0, -1));
  }, []);

  // Calling pinValidation after a timeout is neeed
  // to allow code input to refresh correctly,
  // and in case of error to see the shake animation.
  const onPinValidated = useCallback(
    (v: string) => {
      if (v === pin) {
        setTimeout(() => {
          pinValidation(true);
        }, CODE_INPUT_SUCCESS_CALLBACK_CALL_TIMEOUT);
        return true;
      } else {
        setTimeout(() => {
          pinValidation(false);
          setValue('');
        }, CODE_INPUT_ERROR_ANIMATION_DURATION);
        return false;
      }
    },
    [pin, pinValidation]
  );

  // We don't need to handle the value change on code input,
  // only on number pad.
  const onCodeInputValueChange = useCallback(() => void 0, []);

  return (
    <>
      <View style={styles.codeInputContainer}>
        <CodeInput
          length={PIN_LENGTH}
          onValidate={onPinValidated}
          onValueChange={onCodeInputValueChange}
          value={value}
          variant={'primary'}
        />
      </View>
      {isDevEnv && (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={{
            alignSelf: 'center',
            /* Ugly magic number, but the position is nicer with this value */
            bottom: 38,
            opacity: 0.75,
            position: 'absolute',
            zIndex: 10
          }}
        >
          <IconButton
            accessibilityLabel={'Insert valid pin button (dev only)'}
            color="contrast"
            icon="unlocked"
            iconSize={16}
            onPress={() => {
              setValue(pin);
            }}
          />
        </View>
      )}
      <VSpacer size={48} />
      <View>
        <NumberPad
          deleteAccessibilityLabel={deleteAccessibilityLabel}
          onDeletePress={onDeletePress}
          onNumberPress={onValueChange}
          variant={numberPadVariant}
          {...biometricsConfig}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  codeInputContainer: {
    alignItems: 'center'
  }
});
