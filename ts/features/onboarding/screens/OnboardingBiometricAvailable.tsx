import {Banner, Body, H2, VSpacer} from '@pagopa/io-app-design-system';
import React, {ComponentProps} from 'react';
import {useTranslation} from 'react-i18next';
import {useHeaderSecondLevel} from '../../../hooks/useHeaderSecondLevel';
import {useAppDispatch} from '../../../store';
import {
  preferencesSetIsBiometricEnabled,
  preferencesSetIsOnboardingDone
} from '../../../store/reducers/preferences';
import {IOScrollView} from '../../../components/IOScrollView';
import {mayUserActivateBiometric} from '../utils/biometric';

type IOScrollViewActions = ComponentProps<typeof IOScrollView>['actions'];

/**
 * A screen to show, if the fingerprint is supported by the device and the instruction to enable the fingerprint/faceID usage
 * It concludes the onboarding once the user has read the instructions.
 */
const OnboardingBiometricAvailable = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['onboarding', 'global']);

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
      await mayUserActivateBiometric(
        t('onboarding:biometric.popup.sensorDescription')
      );
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
    type: 'TwoButtons',
    primary: {
      label: t('global:buttons.activate'),
      accessibilityLabel: t('global:buttons.activate'),
      onPress: onPressPrimary
    },
    secondary: {
      label: t('global:buttons.notNow'),
      accessibilityLabel: t('global:buttons.notNow'),
      onPress: onPressSecondary
    }
  };

  return (
    <IOScrollView actions={actions}>
      <H2>{t('onboarding:biometric.available.title')}</H2>
      <VSpacer size={16} />
      <Body>{t('onboarding:biometric.available.body')}</Body>
      <VSpacer size={24} />
      <Banner
        content={t('onboarding:biometric.available.settings')}
        color="neutral"
        size="small"
        pictogramName="activate"
      />
    </IOScrollView>
  );
};

export default OnboardingBiometricAvailable;
