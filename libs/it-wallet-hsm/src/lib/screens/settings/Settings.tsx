import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from '@io-eudiw-app/debug-info';
import {
  preferencesReset,
  preferencesResetMiniAppSelection
} from '@io-eudiw-app/preferences';
import {
  ContentWrapper,
  Divider,
  IOVisualCostants,
  ListItemNav,
  ListItemSwitch,
  useIOToast
} from '@pagopa/io-app-design-system';
import { ComponentProps, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo } from 'react-native';

import AppVersion from '../../components/AppVersion';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetLifecycle } from '../../store/lifecycle';

type ProfileNavListItem = Pick<
  ComponentProps<typeof ListItemNav>,
  'description' | 'onPress' | 'testID'
> & {
  isHidden?: boolean;
  value: string;
};

const DEBUG_TAP_REQUIRED = 4;
const RESET_COUNTER_TIMEOUT = 2000;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const { t } = useTranslation(['common', 'itWalletHsm']);
  const dispatch = useAppDispatch();
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);
  const idResetTap = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);

  useHeaderSecondLevel({
    title: ''
  });

  const profileNavListItems: readonly ProfileNavListItem[] = [
    {
      description: t('itWalletHsm:settings.changeApp.description'),
      onPress: () => dispatch(preferencesResetMiniAppSelection()),
      value: t('itWalletHsm:settings.changeApp.title')
    },
    {
      description: t('itWalletHsm:settings.debug.wallet.description'),
      isHidden: !isDebugModeEnabled,
      onPress: () => {
        dispatch(resetLifecycle());
        toast.success(t('common:generics.success'));
      },
      value: t('itWalletHsm:settings.debug.wallet.title')
    },
    {
      description: t('itWalletHsm:settings.debug.app.description'),
      isHidden: !isDebugModeEnabled,
      onPress: () => {
        dispatch(preferencesReset());
        toast.success(t('common:generics.success'));
      },
      value: t('itWalletHsm:settings.debug.app.title')
    }
  ].filter(({ isHidden }) => !isHidden);

  const renderProfileNavItem = useCallback(
    ({ item }: ListRenderItemInfo<ProfileNavListItem>) => {
      const { description, onPress, testID, value } = item;
      const accessibilityLabel = description
        ? `${value}; ${description}`
        : value;

      return (
        <ListItemNav
          accessibilityLabel={accessibilityLabel}
          description={description}
          onPress={onPress}
          testID={testID}
          value={value}
        />
      );
    },
    []
  );

  const keyExtractor = useCallback(
    (item: ProfileNavListItem, index: number) => `${item.value}-${index}`,
    []
  );

  const resetAppTapCounter = useCallback(() => {
    setTapsOnAppVersion(0);
    clearInterval(idResetTap.current);
  }, []);

  // When tapped 5 times activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  const onTapAppVersion = useCallback(() => {
    if (idResetTap.current) {
      clearInterval(idResetTap.current);
    }
    // do nothing
    if (isDebugModeEnabled) {
      return;
    }
    if (tapsOnAppVersion === DEBUG_TAP_REQUIRED) {
      dispatch(setDebugModeEnabled({ state: true }));
      setTapsOnAppVersion(0);
    } else {
      idResetTap.current = setInterval(
        resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      setTapsOnAppVersion(prevTaps => prevTaps + 1);
    }
  }, [isDebugModeEnabled, resetAppTapCounter, dispatch, tapsOnAppVersion]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        accessibilityLabel: t('itWalletHsm:settings.title'),
        label: t('itWalletHsm:settings.title')
      }}
    >
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={profileNavListItems}
        ItemSeparatorComponent={Divider}
        keyExtractor={keyExtractor}
        renderItem={renderProfileNavItem}
        scrollEnabled={false}
      />
      <ContentWrapper>
        <AppVersion onPress={onTapAppVersion} />
        {isDebugModeEnabled && (
          <ListItemSwitch
            label={t('itWalletHsm:settings.debug.mode')}
            onSwitchValueChange={enabled =>
              dispatch(setDebugModeEnabled({ state: enabled }))
            }
            testID="debugModeSwitch"
            value={isDebugModeEnabled}
          />
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
