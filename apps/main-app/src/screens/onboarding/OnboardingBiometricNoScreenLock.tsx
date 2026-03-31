import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { IOScrollViewWithListItems } from '../../components/IOScrollViewWithListItems';
import { useAppDispatch } from '../../store';
import { useHeaderSecondLevel } from '@io-eudiw-app/commons';
import { preferencesSetIsOnboardingDone } from '@io-eudiw-app/preferences';

/**
 * A screen to be shown if the user has not set a screen lock with intructions on how to set it.
 * It concludes the onboarding once the user has read the instructions.
 */
const OnboardingBiometricNoScreenLock = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global', 'common']);

  useHeaderSecondLevel({
    title: '',
    goBack: () => dispatch(preferencesSetIsOnboardingDone())
  });

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: t(
          'global:onboarding.biometric.noLockScreen.list.firstItem.label'
        ),
        value: t(
          'global:onboarding.biometric.noLockScreen.list.firstItem.value'
        ),
        icon: 'systemSettingsAndroid'
      },
      {
        label: t(
          'global:onboarding.biometric.noLockScreen.list.secondItem.label'
        ),
        value: t(
          'global:onboarding.biometric.noLockScreen.list.secondItem.value'
        ),
        icon: Platform.select({
          ios: 'systemPasswordiOS',
          android: 'systemPasswordAndroid'
        })
      }
    ],
    [t]
  );

  const actionProps = useMemo(
    () => ({
      label: t('common:buttons.continue'),
      accessibilityLabel: t('common:buttons.continue'),
      onPress: () => dispatch(preferencesSetIsOnboardingDone())
    }),
    [dispatch, t]
  );

  return (
    <IOScrollViewWithListItems
      title={t('global:onboarding.biometric.noLockScreen.title')}
      subtitle={t('global:onboarding.biometric.noLockScreen.subtitle')}
      listItemHeaderLabel={t(
        'global:onboarding.biometric.noLockScreen.list.header'
      )}
      renderItems={listItems}
      actions={{
        primary: actionProps,
        type: 'SingleButton'
      }}
    />
  );
};

export default OnboardingBiometricNoScreenLock;
