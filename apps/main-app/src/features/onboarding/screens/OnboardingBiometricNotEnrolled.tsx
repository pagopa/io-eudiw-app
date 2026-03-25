import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IOScrollViewWithListItems } from '../../../components/IOScrollViewWithListItems';
import { useAppDispatch } from '../../../store';
import { preferencesSetIsOnboardingDone } from '@io-eudiw-app/preferences';
import { useHeaderSecondLevel } from '@io-eudiw-app/commons';

/**
 * Screen to be shown if the user has not enrolled in biometric authentication but the device supports it.
 * It provides instructions on how to enable biometric authentication.
 * It concludes the onboarding once the user has read the instructions.
 */
const OnboardingBiometricNotEnrolled = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['common', 'global']);

  const concludeOnboarding = () => dispatch(preferencesSetIsOnboardingDone());

  useHeaderSecondLevel({
    goBack: concludeOnboarding,
    title: ''
  });

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: t(
          'global:onboarding.biometric.notEnrolled.list.firstItem.label'
        ),
        value: t(
          'global:onboarding.biometric.notEnrolled.list.firstItem.value'
        ),
        icon: 'systemSettingsAndroid'
      },
      {
        label: t(
          'global:onboarding.biometric.notEnrolled.list.secondItem.label'
        ),
        value: t(
          'global:onboarding.biometric.notEnrolled.list.secondItem.value'
        ),
        icon: 'systemBiometricRecognitionOS'
      },
      {
        label: t(
          'global:onboarding.biometric.notEnrolled.list.thirdItem.label'
        ),
        value: t(
          'global:onboarding.biometric.notEnrolled.list.thirdItem.value'
        ),
        icon: 'systemToggleInstructions'
      }
    ],
    [t]
  );

  const primaryActionProps = {
    label: t('common:buttons.continue'),
    accessibilityLabel: t('common:buttons.continue'),
    onPress: concludeOnboarding,
    testID: 'not-enrolled-biometric-confirm'
  };

  return (
    <IOScrollViewWithListItems
      title={t('global:onboarding.biometric.title')}
      subtitle={t('global:onboarding.biometric.notEnrolled.description')}
      listItemHeaderLabel={t(
        'global:onboarding.biometric.notEnrolled.list.header'
      )}
      renderItems={listItems}
      actions={{
        primary: primaryActionProps,
        type: 'SingleButton'
      }}
    />
  );
};

export default OnboardingBiometricNotEnrolled;
