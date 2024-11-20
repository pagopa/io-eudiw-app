import {ListItemInfo} from '@pagopa/io-app-design-system';
import React, {useMemo} from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useHeaderSecondLevel} from '../../../hooks/useHeaderSecondLevel';
import {useAppDispatch} from '../../../store';
import {IOScrollViewWithListItems} from '../../../components/IOScrollViewWithListItems';
import {preferencesSetIsOnboardingDone} from '../../../store/reducers/preferences';

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const OnboardingBiometricNoScreenLock = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['onboarding', 'global']);

  useHeaderSecondLevel({
    title: '',
    goBack: () => dispatch(preferencesSetIsOnboardingDone())
  });

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: t('onboarding:biometric.noLockScreen.list.firstItem.label'),
        value: t('onboarding:biometric.noLockScreen.list.firstItem.value'),
        icon: 'systemSettingsAndroid'
      },
      {
        label: t('onboarding:biometric.noLockScreen.list.secondItem.label'),
        value: t('onboarding:biometric.noLockScreen.list.secondItem.value'),
        icon: Platform.select({
          ios: 'systemPasswordiOS',
          android: 'systemPasswordAndroid'
        })
      }
    ],
    []
  );

  const actionProps = useMemo(
    () => ({
      label: t('global:buttons.continue'),
      accessibilityLabel: t('global:buttons.continue'),
      onPress: () => dispatch(preferencesSetIsOnboardingDone())
    }),
    [dispatch]
  );

  return (
    <IOScrollViewWithListItems
      title={t('onboarding:biometric.noLockScreen.title')}
      subtitle={t('onboarding:biometric.noLockScreen.subtitle')}
      listItemHeaderLabel={t('onboarding:biometric.noLockScreen.list.header')}
      renderItems={listItems}
      actions={{
        primary: actionProps,
        type: 'SingleButton'
      }}
    />
  );
};

export default OnboardingBiometricNoScreenLock;
