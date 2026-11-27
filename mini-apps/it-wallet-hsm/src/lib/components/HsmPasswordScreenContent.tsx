import {
  IOMarkdown,
  IOScrollViewWithLargeHeader,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  Alert,
  ContentWrapper,
  FooterActions,
  IOButton,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useStartIdentityRecovery } from '../hooks/useStartIdentityRecovery';
import { useAppSelector } from '../store';
import {
  HSM_PASSWORD_MAX_ATTEMPTS,
  selectHsmPasswordRemainingAttempts
} from '../store/instance';
import { PASSWORD_MIN_LENGTH } from '../utils/password';
import { PasswordField } from './PasswordField';

type HsmPasswordScreenContentProps = {
  /**
   * Whether the operation is being authorized with the entered password
   */
  isAuthorizing: boolean;
  /**
   * Called when the user goes back, which should ask to confirm the cancellation of the operation
   */
  onBack: () => void;
  /**
   * Called before starting the identity recovery when the user forgot the password, to cancel the operation
   */
  onForgotPassword: () => void;
  onSubmit: (password: string) => void;
};

/**
 * Screen content which asks the user for the IT-Wallet password, which authorizes the presentation of the credentials
 * bound to a Remote WSCD key, such as the PID. It shows the attempts left, which are tracked in the instance state.
 */
export const HsmPasswordScreenContent = ({
  isAuthorizing,
  onBack,
  onForgotPassword,
  onSubmit
}: HsmPasswordScreenContentProps) => {
  const { t } = useTranslation(['hsm', 'common']);
  const { startIdentityRecovery } = useStartIdentityRecovery();
  const remainingAttempts = useAppSelector(selectHsmPasswordRemainingAttempts);
  const [password, setPassword] = useState('');

  const [attemptsOfPassword, setAttemptsOfPassword] =
    useState(remainingAttempts);

  // A wrong password is cleared to let the user enter it again
  if (attemptsOfPassword !== remainingAttempts) {
    setAttemptsOfPassword(remainingAttempts);
    setPassword('');
  }

  useDisableGestureNavigation();
  useHardwareBackButton(() => {
    onBack();
    return true;
  });
  useHeaderSecondLevel({ goBack: onBack, title: '' });

  const forgotPasswordBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <IOMarkdown
          content={t('presentation.hsmPassword.bottomSheet.body', {
            minLength: PASSWORD_MIN_LENGTH
          })}
        />
        <VSpacer size={32} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          primary: {
            label: t('presentation.hsmPassword.bottomSheet.primaryAction'),
            onPress: () => {
              forgotPasswordBottomSheet.dismiss();
              onForgotPassword();
              startIdentityRecovery();
            }
          },
          secondary: {
            label: t('common:buttons.close'),
            onPress: () => forgotPasswordBottomSheet.dismiss()
          },
          type: 'TwoButtons'
        }}
      />
    ),
    title: t('presentation.hsmPassword.bottomSheet.title')
  });

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        primary: {
          disabled: password.length === 0,
          label: t('presentation.hsmPassword.primaryAction'),
          loading: isAuthorizing,
          onPress: () => onSubmit(password)
        },
        type: 'SingleButton'
      }}
      description={t('presentation.hsmPassword.description')}
      title={{ label: t('presentation.hsmPassword.title') }}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={24}>
          <PasswordField
            accessibilityLabel={t('presentation.hsmPassword.inputLabel')}
            bottomMessage={t('presentation.hsmPassword.attempt', {
              attempt: HSM_PASSWORD_MAX_ATTEMPTS - remainingAttempts + 1,
              maxAttempts: HSM_PASSWORD_MAX_ATTEMPTS
            })}
            isEditing={!isAuthorizing}
            onChangeText={setPassword}
            placeholder={t('presentation.hsmPassword.inputLabel')}
            rightAction={{
              hideAccessibilityLabel: t('presentation.hsmPassword.hide'),
              revealAccessibilityLabel: t('presentation.hsmPassword.reveal'),
              type: 'reveal'
            }}
            value={password}
          />
          {remainingAttempts < HSM_PASSWORD_MAX_ATTEMPTS && (
            <Alert
              content={
                remainingAttempts === 1
                  ? t('presentation.hsmPassword.remainingAttempts.one')
                  : t('presentation.hsmPassword.remainingAttempts.many', {
                      attempts: remainingAttempts
                    })
              }
              variant="warning"
            />
          )}
          <View style={styles.forgotPassword}>
            <IOButton
              label={t('presentation.hsmPassword.forgot')}
              onPress={forgotPasswordBottomSheet.present}
              variant="link"
            />
          </View>
        </VStack>
      </ContentWrapper>
      {forgotPasswordBottomSheet.bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    alignItems: 'flex-start'
  }
});
