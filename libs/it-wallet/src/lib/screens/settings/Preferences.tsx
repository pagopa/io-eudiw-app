/**
 * Implements the preferences screen where the user can see and update his
 * preferences about notifications, calendar, services, messages and languages
 */
import { ComponentProps, useRef } from 'react';
import { FlatList, ListRenderItemInfo, View } from 'react-native';
import {
  Divider,
  IOVisualCostants,
  ListItemNav
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';

type PreferencesNavListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  'description' | 'testID' | 'onPress'
>;

const Preferences = () => {
  const titleRef = useRef<View>(null);
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();

  useHeaderSecondLevel({
    title: ''
  });

  const preferencesNavListItems: ReadonlyArray<PreferencesNavListItem> = [
    {
      // Appearance
      value: t('wallet:settings.preferences.appearance.title'),
      description: t('wallet:settings.preferences.appearance.description'),
      onPress: () => navigation.navigate('MAIN_SETTINGS_PREFERENCES_APPEARANCE')
    }
  ];

  const renderPreferencesNavItem = ({
    item: { value, description, onPress, testID }
  }: ListRenderItemInfo<PreferencesNavListItem>) => (
    <ListItemNav
      accessibilityLabel={`${value} ${description}`}
      value={value}
      description={description}
      onPress={onPress}
      testID={testID}
    />
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('wallet:settings.preferences.title')
      }}
      description={t('wallet:settings.preferences.description')}
      ref={titleRef}
    >
      <FlatList
        scrollEnabled={false}
        keyExtractor={(item: PreferencesNavListItem, index: number) =>
          `${item.value}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={preferencesNavListItems}
        renderItem={renderPreferencesNavItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default Preferences;
