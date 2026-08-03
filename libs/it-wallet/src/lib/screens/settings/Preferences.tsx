import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
/**
 * Implements the preferences screen where the user can see and update his
 * preferences about notifications, calendar, services, messages and languages
 */
import { ComponentProps, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, View } from 'react-native';

import MAIN_ROUTES from '../../navigation/main/routes';

type PreferencesNavListItem = Pick<
  ComponentProps<typeof ListItemNav>,
  'description' | 'onPress' | 'testID'
> & {
  value: string;
};

const Preferences = () => {
  const titleRef = useRef<View>(null);
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();

  useHeaderSecondLevel({
    title: ''
  });

  const preferencesNavListItems: readonly PreferencesNavListItem[] = [
    {
      description: t('wallet:settings.preferences.appearance.description'),
      onPress: () =>
        navigation.navigate(MAIN_ROUTES.SETTINGS.PREFERENCES.APPEARANCE),
      // Appearance
      value: t('wallet:settings.preferences.appearance.title')
    }
  ];

  const renderPreferencesNavItem = ({
    item: { description, onPress, testID, value }
  }: ListRenderItemInfo<PreferencesNavListItem>) => (
    <ListItemNav
      description={description}
      onPress={onPress}
      testID={testID}
      value={value}
    />
  );

  return (
    <IOScrollViewWithLargeHeader
      description={t('wallet:settings.preferences.description')}
      ref={titleRef}
      title={{
        label: t('wallet:settings.preferences.title')
      }}
    >
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={preferencesNavListItems}
        ItemSeparatorComponent={Divider}
        keyExtractor={(item: PreferencesNavListItem, index: number) =>
          `${item.value}-${index}`
        }
        renderItem={renderPreferencesNavItem}
        scrollEnabled={false}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default Preferences;
