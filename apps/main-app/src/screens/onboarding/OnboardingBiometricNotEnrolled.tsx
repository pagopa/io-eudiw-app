import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { preferencesSetIsOnboardingDone } from '@io-eudiw-app/preferences';
import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../store';

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

  const listItems = useMemo<ListItemInfo[]>(
    () => [
      {
        icon: 'systemSettingsAndroid',
        label: t(
          'global:onboarding.biometric.notEnrolled.list.firstItem.label'
        ),
        value: t('global:onboarding.biometric.notEnrolled.list.firstItem.value')
      },
      {
        icon: 'systemBiometricRecognitionOS',
        label: t(
          'global:onboarding.biometric.notEnrolled.list.secondItem.label'
        ),
        value: t(
          'global:onboarding.biometric.notEnrolled.list.secondItem.value'
        )
      },
      {
        icon: 'systemToggleInstructions',
        label: t(
          'global:onboarding.biometric.notEnrolled.list.thirdItem.label'
        ),
        value: t('global:onboarding.biometric.notEnrolled.list.thirdItem.value')
      }
    ],
    [t]
  );

  const primaryActionProps = {
    accessibilityLabel: t('common:buttons.continue'),
    label: t('common:buttons.continue'),
    onPress: concludeOnboarding,
    testID: 'not-enrolled-biometric-confirm'
  };

  return (
    <IOScrollViewWithListItems
      actions={{
        primary: primaryActionProps,
        type: 'SingleButton'
      }}
      listItemHeaderLabel={t(
        'global:onboarding.biometric.notEnrolled.list.header'
      )}
      renderItems={listItems}
      subtitle={t('global:onboarding.biometric.notEnrolled.description')}
      title={t('global:onboarding.biometric.title')}
    />
  );
};

export default OnboardingBiometricNotEnrolled;
