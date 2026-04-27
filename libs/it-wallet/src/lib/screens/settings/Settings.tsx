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
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from '@io-eudiw-app/debug-info';
import { resetLifecycle } from '../../store/lifecycle';
import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesResetMiniAppSelection
} from '@io-eudiw-app/preferences';
import { useNavigation } from '@react-navigation/native';
import MAIN_ROUTES from '../../navigation/main/routes';
import AppVersion from '../../components/AppVersion';

type ProfileNavListItem = {
  value: string;
  isHidden?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  'description' | 'testID' | 'onPress'
>;

const DEBUG_TAP_REQUIRED = 4;
const RESET_COUNTER_TIMEOUT = 2000;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const navigation = useNavigation();
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);
  const idResetTap = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);

  useHeaderSecondLevel({
    title: ''
  });

  const profileNavListItems: ReadonlyArray<ProfileNavListItem> = [
    {
      // Preferences
      value: t('wallet:settings.preferences.title'),
      description: t('wallet:settings.preferences.description'),
      onPress: () => navigation.navigate(MAIN_ROUTES.SETTINGS.PREFERENCES.MAIN)
    },
    {
      value: t('wallet:settings.changeApp.title'),
      description: t('wallet:settings.changeApp.description'),
      onPress: () => dispatch(preferencesResetMiniAppSelection())
    },
    {
      value: t('wallet:settings.debug.wallet.title'),
      description: t('wallet:settings.debug.wallet.description'),
      onPress: () => {
        dispatch(resetLifecycle());
        toast.success(t('common:generics.success'));
      },
      isHidden: !isDebugModeEnabled
    },
    {
      value: t('wallet:settings.debug.app.title'),
      description: t('wallet:settings.debug.app.description'),
      onPress: () => {
        dispatch(preferencesReset());
        toast.success(t('common:generics.success'));
      },
      isHidden: !isDebugModeEnabled
    }
  ].filter(({ isHidden }) => !isHidden);

  const renderProfileNavItem = useCallback(
    ({ item }: ListRenderItemInfo<ProfileNavListItem>) => {
      const { value, description, testID, onPress } = item;
      const accessibilityLabel = description
        ? `${value}; ${description}`
        : value;

      return (
        <ListItemNav
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          value={value}
          description={description}
          onPress={onPress}
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
        label: t('wallet:settings.title'),
        accessibilityLabel: t('wallet:settings.title')
      }}
    >
      <FlatList
        scrollEnabled={false}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={profileNavListItems}
        renderItem={renderProfileNavItem}
        ItemSeparatorComponent={Divider}
      />
      <ContentWrapper>
        <AppVersion onPress={onTapAppVersion} />
        {isDebugModeEnabled && (
          <ListItemSwitch
            testID="debugModeSwitch"
            label={t('wallet:settings.debug.mode')}
            value={isDebugModeEnabled}
            onSwitchValueChange={enabled =>
              dispatch(setDebugModeEnabled({ state: enabled }))
            }
          />
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
