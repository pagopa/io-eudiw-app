import {Banner, Body, H2, VSpacer} from '@pagopa/io-app-design-system';
import React, {ComponentProps, useMemo} from 'react';
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
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const OnboardingBiometricAvailable = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['onboarding', 'global']);

  useHeaderSecondLevel({
    goBack: () => dispatch(preferencesSetIsOnboardingDone()),
    title: ''
  });

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

  const onPressSecondary = () => {
    dispatch(preferencesSetIsBiometricEnabled(false));
    dispatch(preferencesSetIsOnboardingDone());
  };

  const actions = useMemo<IOScrollViewActions>(
    () => ({
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
    }),
    [dispatch, onPressPrimary, onPressSecondary, t]
  );

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
