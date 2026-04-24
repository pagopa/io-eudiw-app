import {
  Divider,
  IOVisualCostants,
  ListItemNav,
  useIOToast
} from '@pagopa/io-app-design-system';
import { ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectIsDebugModeEnabled } from '@io-eudiw-app/debug-info';
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

type ProfileNavListItem = {
  value: string;
  isHidden?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  'description' | 'testID' | 'onPress'
>;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const navigation = useNavigation();
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);

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
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
