import { IOScrollView, useHeaderSecondLevel } from '@io-eudiw-app/commons';
import { confirmBiometricEnabling } from '@io-eudiw-app/identification';
import {
  preferencesSetIsBiometricEnabled,
  preferencesSetIsOnboardingDone
} from '@io-eudiw-app/preferences';
import { Banner, Body, H2, VSpacer } from '@pagopa/io-app-design-system';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../store';

type IOScrollViewActions = ComponentProps<typeof IOScrollView>['actions'];

/**
 * A screen to show, if the fingerprint is supported by the device and the instruction to enable the fingerprint/faceID usage
 * It concludes the onboarding once the user has read the instructions.
 */
const OnboardingBiometricAvailable = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['common', 'global']);

  useHeaderSecondLevel({
    goBack: () => dispatch(preferencesSetIsOnboardingDone()),
    title: ''
  });

  /**
   * Activates the biometric authentication, sets it as enabled and concludes the onboarding.
   * If an error occurs while activating the biometric authentication, it sets it as disabled.
   */
  const onPressPrimary = async () => {
    try {
      const description = t(
        'global:identification.biometric.sensorDescription'
      );
      await confirmBiometricEnabling(description);
      dispatch(preferencesSetIsBiometricEnabled(true));
    } catch (err) {
      if (err === 'PERMISSION_DENIED') {
        dispatch(preferencesSetIsBiometricEnabled(false));
      }
    } finally {
      dispatch(preferencesSetIsOnboardingDone());
    }
  };

  /**
   * Sets the biometric authentication as disabled and concludes the onboarding.
   */
  const onPressSecondary = () => {
    dispatch(preferencesSetIsBiometricEnabled(false));
    dispatch(preferencesSetIsOnboardingDone());
  };

  const actions: IOScrollViewActions = {
    primary: {
      accessibilityLabel: t('common:buttons.activate'),
      label: t('common:buttons.activate'),
      onPress: onPressPrimary
    },
    secondary: {
      accessibilityLabel: t('common:buttons.notNow'),
      label: t('common:buttons.notNow'),
      onPress: onPressSecondary
    },
    type: 'TwoButtons'
  };

  return (
    <IOScrollView actions={actions}>
      <H2>{t('global:onboarding.biometric.available.title')}</H2>
      <VSpacer size={16} />
      <Body>{t('global:onboarding.biometric.available.body')}</Body>
      <VSpacer size={24} />
      <Banner
        color="neutral"
        content={t('global:onboarding.biometric.available.settings')}
        pictogramName="activate"
      />
    </IOScrollView>
  );
};

export default OnboardingBiometricAvailable;
