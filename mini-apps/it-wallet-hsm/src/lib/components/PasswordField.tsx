import {
  BodySmall,
  Icon,
  IconButton,
  IOColors,
  IOMaxFontSizeMultiplier,
  makeFontStyleObject,
  useIONewTypeface,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Ref, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

type Props = {
  accessibilityLabel: string;
  bottomMessage?: string;
  inputRef?: Ref<TextInput>;
  isEditing: boolean;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  /**
   * Label shown inside the field, which moves above the value when the field is focused or filled
   */
  placeholder?: string;
  rightAction: RightAction;
  value: string;
};

/**
 * The value is either shown locked with an edit button, or masked with a button to reveal it.
 */
// Same label transition of the design system inputs
const LABEL_TRANSITION = {
  duration: 250,
  easing: Easing.inOut(Easing.cubic)
};
const LABEL_SCALE_FACTOR = 0.75;
const LABEL_TRANSLATE_Y = -12;
// Moves the value below the label
const VALUE_MARGIN_TOP = 16;

type RightAction =
  | {
      editAccessibilityLabel: string;
      onEditPress: () => void;
      type: 'edit';
    }
  | {
      hideAccessibilityLabel: string;
      revealAccessibilityLabel: string;
      type: 'reveal';
    };

/**
 * Password field which reproduces the look of the design system inputs using the same theme tokens.
 * The design system inputs don't allow a custom right element, dim the whole field when disabled,
 * and push the text down on iOS, thus they are not used.
 */
export const PasswordField = ({
  accessibilityLabel,
  bottomMessage,
  inputRef,
  isEditing,
  onBlur,
  onChangeText,
  placeholder,
  rightAction,
  value
}: Props) => {
  const theme = useIOTheme();
  const { newTypefaceEnabled } = useIONewTypeface();
  const [isRevealed, setIsRevealed] = useState(false);
  const isFocused = useSharedValue(false);
  const hasValue = value.length > 0;

  const labelFont = makeFontStyleObject(
    16,
    newTypefaceEnabled ? 'Titillio' : 'TitilliumSansPro',
    undefined,
    'Regular'
  );

  const animatedLabelStyle = useAnimatedStyle(() => {
    const isRaised = isFocused.value || hasValue;
    return {
      transform: [
        {
          translateY: withTiming(
            isRaised ? LABEL_TRANSLATE_Y : 0,
            LABEL_TRANSITION
          )
        },
        {
          scale: withTiming(isRaised ? LABEL_SCALE_FACTOR : 1, LABEL_TRANSITION)
        }
      ]
    };
  });

  const borderStyle = isEditing
    ? {
        borderColor: IOColors[theme['interactiveElem-default']],
        borderWidth: 2,
        paddingHorizontal: 11
      }
    : {
        borderColor: IOColors[theme['textInputBorder-default']],
        borderWidth: 1,
        paddingHorizontal: 12
      };

  return (
    <View>
      <View style={[styles.container, borderStyle]}>
        <Icon color={theme['icon-decorative']} name="locked" size={24} />
        <View style={styles.inputWrapper}>
          {placeholder && (
            <View pointerEvents="none" style={styles.labelWrapper}>
              <Animated.Text
                accessible={false}
                maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
                numberOfLines={1}
                style={[
                  labelFont,
                  styles.label,
                  { color: IOColors[theme['textInputLabel-default']] },
                  animatedLabelStyle
                ]}
              >
                {placeholder}
              </Animated.Text>
            </View>
          )}
          <TextInput
            accessibilityLabel={accessibilityLabel}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            cursorColor={IOColors[theme['interactiveElem-default']]}
            editable={isEditing}
            maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
            onBlur={() => {
              isFocused.value = false;
              onBlur?.();
            }}
            onChangeText={onChangeText}
            onFocus={() => {
              isFocused.value = true;
            }}
            ref={inputRef}
            secureTextEntry={rightAction.type === 'reveal' && !isRevealed}
            selectionColor={IOColors[theme['interactiveElem-default']]}
            style={[
              makeFontStyleObject(
                16,
                newTypefaceEnabled ? 'Titillio' : 'TitilliumSansPro',
                // A line height on single-line inputs pushes the text down on iOS
                undefined,
                'Semibold'
              ),
              styles.input,
              placeholder !== undefined && styles.inputBelowLabel,
              {
                color:
                  IOColors[
                    theme[
                      isEditing
                        ? 'textInputValue-default'
                        : 'textInputValue-disabled'
                    ]
                  ]
              }
            ]}
            value={value}
          />
        </View>
        {rightAction.type === 'edit' ? (
          <IconButton
            accessibilityLabel={rightAction.editAccessibilityLabel}
            icon="edit"
            onPress={rightAction.onEditPress}
          />
        ) : (
          <IconButton
            accessibilityLabel={
              isRevealed
                ? rightAction.hideAccessibilityLabel
                : rightAction.revealAccessibilityLabel
            }
            icon={isRevealed ? 'eyeHide' : 'eyeShow'}
            onPress={() => setIsRevealed(revealed => !revealed)}
          />
        )}
      </View>
      {bottomMessage && (
        <BodySmall
          color={theme['textBody-tertiary']}
          style={styles.bottomMessage}
          weight="Regular"
        >
          {bottomMessage}
        </BodySmall>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomMessage: {
    marginTop: 4,
    paddingHorizontal: 12
  },
  container: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 8,
    columnGap: 8,
    flexDirection: 'row',
    height: 60
  },
  input: {
    height: 24,
    includeFontPadding: false,
    paddingVertical: 0,
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && { marginLeft: -4 })
  },
  inputBelowLabel: {
    marginTop: VALUE_MARGIN_TOP
  },
  inputWrapper: {
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center'
  },
  label: {
    transformOrigin: 'left center'
  },
  labelWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center'
  }
});
