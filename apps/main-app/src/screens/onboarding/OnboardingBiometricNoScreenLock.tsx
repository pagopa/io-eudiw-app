import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { preferencesSetIsOnboardingDone } from '@io-eudiw-app/preferences';
import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useAppDispatch } from '../../store';

/**
 * A screen to be shown if the user has not set a screen lock with intructions on how to set it.
 * It concludes the onboarding once the user has read the instructions.
 */
const OnboardingBiometricNoScreenLock = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global', 'common']);

  useHeaderSecondLevel({
    goBack: () => dispatch(preferencesSetIsOnboardingDone()),
    title: ''
  });

  const listItems = useMemo<ListItemInfo[]>(
    () => [
      {
        icon: 'systemSettingsAndroid',
        label: t(
          'global:onboarding.biometric.noLockScreen.list.firstItem.label'
        ),
        value: t(
          'global:onboarding.biometric.noLockScreen.list.firstItem.value'
        )
      },
      {
        icon: Platform.select({
          android: 'systemPasswordAndroid',
          ios: 'systemPasswordiOS'
        }),
        label: t(
          'global:onboarding.biometric.noLockScreen.list.secondItem.label'
        ),
        value: t(
          'global:onboarding.biometric.noLockScreen.list.secondItem.value'
        )
      }
    ],
    [t]
  );

  const actionProps = useMemo(
    () => ({
      accessibilityLabel: t('common:buttons.continue'),
      label: t('common:buttons.continue'),
      onPress: () => dispatch(preferencesSetIsOnboardingDone())
    }),
    [dispatch, t]
  );

  return (
    <IOScrollViewWithListItems
      actions={{
        primary: actionProps,
        type: 'SingleButton'
      }}
      listItemHeaderLabel={t(
        'global:onboarding.biometric.noLockScreen.list.header'
      )}
      renderItems={listItems}
      subtitle={t('global:onboarding.biometric.noLockScreen.subtitle')}
      title={t('global:onboarding.biometric.noLockScreen.title')}
    />
  );
};

export default OnboardingBiometricNoScreenLock;
