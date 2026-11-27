import {
  clipboardSetStringWithFeedback,
  IOMarkdown,
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  BodySmall,
  ButtonText,
  ContentWrapper,
  FooterActions,
  HStack,
  Icon,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { StackScreenProps } from '@react-navigation/stack';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { PasswordField } from '../../components/PasswordField';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch } from '../../store';
import { setPidIssuancePassword } from '../../store/pidIssuance';
import {
  generatePassword,
  getPasswordRequirements,
  isValidPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS
} from '../../utils/password';

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PID_ISSUANCE_PASSWORD'
>;

/**
 * Screen which shows the HSM password generated for the user, who can edit it.
 * Once confirmed, the password is handed over to the PID issuance flow and the user moves forward to the PID preview screen.
 */
const PidIssuancePassword = ({ navigation }: Props) => {
  const { t } = useTranslation(['hsm', 'common']);
  const [password, setPassword] = useState(generatePassword);
  const [isEditing, setIsEditing] = useState(false);
  const theme = useIOTheme();
  const dispatch = useAppDispatch();
  const inputRef = useRef<TextInput>(null);
  const isValid = isValidPassword(password);
  const requirements = getPasswordRequirements(password);

  useHeaderSecondLevel({ title: '' });

  const startEditing = () => {
    setIsEditing(true);
    // The input must be enabled before it can be focused
    setTimeout(() => inputRef.current?.focus());
  };

  const stopEditing = () => {
    if (isValidPassword(password)) {
      setIsEditing(false);
    }
  };

  const lostPasswordBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <IOMarkdown content={t('pidIssuance.password.bottomSheet.body')} />
        <VSpacer size={32} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          primary: {
            label: t('pidIssuance.password.bottomSheet.primaryAction'),
            onPress: () => {
              lostPasswordBottomSheet.dismiss();
              dispatch(setPidIssuancePassword({ password }));
              navigation.replace('PID_ISSUANCE_PREVIEW');
            }
          },
          type: 'SingleButton'
        }}
      />
    ),
    title: t('pidIssuance.password.bottomSheet.title')
  });

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        primary: {
          disabled: !isValid,
          label: t('pidIssuance.password.primaryAction'),
          onPress: () => {
            inputRef.current?.blur();
            setIsEditing(false);
            lostPasswordBottomSheet.present();
          }
        },
        type: 'SingleButton'
      }}
      title={{ label: t('pidIssuance.password.title') }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <PasswordField
          accessibilityLabel={t('pidIssuance.password.inputLabel')}
          inputRef={inputRef}
          isEditing={isEditing}
          onBlur={stopEditing}
          onChangeText={setPassword}
          rightAction={{
            editAccessibilityLabel: t('pidIssuance.password.edit'),
            onEditPress: startEditing,
            type: 'edit'
          }}
          value={password}
        />
        {isEditing && (
          <VStack space={4} style={styles.requirements}>
            <BodySmall color="grey-700">
              {t('pidIssuance.password.requirements.title', {
                minLength: PASSWORD_MIN_LENGTH
              })}
            </BodySmall>
            {PASSWORD_REQUIREMENTS.map(requirement => (
              <HStack key={requirement} space={8} style={styles.requirement}>
                <Icon
                  color={requirements[requirement] ? 'success-500' : 'grey-300'}
                  name="success"
                  size={16}
                />
                <BodySmall color="grey-700">
                  {t(`pidIssuance.password.requirements.${requirement}`)}
                </BodySmall>
              </HStack>
            ))}
          </VStack>
        )}
        <VSpacer size={24} />
        <Pressable
          accessibilityLabel={t('pidIssuance.password.copy')}
          accessibilityRole="button"
          hitSlop={14}
          onPress={() =>
            clipboardSetStringWithFeedback(
              password,
              t('pidIssuance.password.copied')
            )
          }
          style={({ pressed }) => [styles.copy, pressed && styles.pressed]}
        >
          <Icon
            allowFontScaling
            color={theme['interactiveElem-default']}
            name="copy"
            size={24}
          />
          <ButtonText color={theme['interactiveElem-default']}>
            {t('pidIssuance.password.copy')}
          </ButtonText>
        </Pressable>
      </ContentWrapper>
      {lostPasswordBottomSheet.bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default PidIssuancePassword;

const styles = StyleSheet.create({
  copy: {
    alignItems: 'center',
    alignSelf: 'center',
    columnGap: 8,
    flexDirection: 'row',
    paddingVertical: 8
  },
  pressed: {
    opacity: 0.6
  },
  requirement: {
    alignItems: 'center'
  },
  requirements: {
    marginTop: 8
  }
});
