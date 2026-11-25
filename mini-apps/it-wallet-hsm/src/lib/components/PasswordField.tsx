import {
  Icon,
  IconButton,
  IOColors,
  IOMaxFontSizeMultiplier,
  makeFontStyleObject,
  useIONewTypeface,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Ref } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  accessibilityLabel: string;
  editAccessibilityLabel: string;
  inputRef: Ref<TextInput>;
  isEditing: boolean;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onEditPress: () => void;
  value: string;
};

/**
 * Password field which shows a locked value that can be edited by pressing the edit button.
 * The design system inputs don't allow a custom right element, and dim the whole field when disabled,
 * thus this component reproduces their look using the same theme tokens.
 */
export const PasswordField = ({
  accessibilityLabel,
  editAccessibilityLabel,
  inputRef,
  isEditing,
  onBlur,
  onChangeText,
  onEditPress,
  value
}: Props) => {
  const theme = useIOTheme();
  const { newTypefaceEnabled } = useIONewTypeface();

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
    <View style={[styles.container, borderStyle]}>
      <Icon color={theme['icon-decorative']} name="locked" size={24} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        cursorColor={IOColors[theme['interactiveElem-default']]}
        editable={isEditing}
        maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
        onBlur={onBlur}
        onChangeText={onChangeText}
        ref={inputRef}
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
      <IconButton
        accessibilityLabel={editAccessibilityLabel}
        icon="edit"
        onPress={onEditPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 8,
    columnGap: 8,
    flexDirection: 'row',
    height: 60
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    height: 24,
    includeFontPadding: false,
    paddingVertical: 0,
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && { marginLeft: -4 })
  }
});
