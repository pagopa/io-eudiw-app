import {ListItemInfo} from '@pagopa/io-app-design-system';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useHeaderSecondLevel} from '../../../hooks/useHeaderSecondLevel';
import {IOScrollViewWithListItems} from '../../../components/IOScrollViewWithListItems';
import {useAppDispatch} from '../../../store';
import {preferencesSetIsOnboardingDone} from '../../../store/reducers/preferences';
/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const OnboardingBiometricNotEnrolled = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['onboarding', 'global']);

  const concludeOnboarding = () => dispatch(preferencesSetIsOnboardingDone());

  useHeaderSecondLevel({
    goBack: concludeOnboarding,
    title: ''
  });

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: t('onboarding:biometric.notEnrolled.list.firstItem.label'),
        value: t('onboarding:biometric.notEnrolled.list.firstItem.value'),
        icon: 'systemSettingsAndroid'
      },
      {
        label: t('onboarding:biometric.notEnrolled.list.secondItem.label'),
        value: t('onboarding:biometric.notEnrolled.list.secondItem.value'),
        icon: 'systemBiometricRecognitionOS'
      },
      {
        label: t('onboarding:biometric.notEnrolled.list.thirdItem.label'),
        value: t('onboarding:biometric.notEnrolled.list.thirdItem.value'),
        icon: 'systemToggleInstructions'
      }
    ],
    []
  );

  const primaryActionProps = {
    label: t('global:buttons.continue'),
    accessibilityLabel: t('global:buttons.continue'),
    onPress: concludeOnboarding,
    testID: 'not-enrolled-biometric-confirm'
  };

  return (
    <IOScrollViewWithListItems
      title={t('onboarding:biometric.title')}
      subtitle={t('onboarding:biometric.notEnrolled.description')}
      listItemHeaderLabel={t('onboarding:biometric.notEnrolled.list.header')}
      renderItems={listItems}
      actions={{
        primary: primaryActionProps,
        type: 'SingleButton'
      }}
    />
  );
};

export default OnboardingBiometricNotEnrolled;
