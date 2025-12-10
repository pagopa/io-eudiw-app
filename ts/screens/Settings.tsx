import {
  IOButton,
  IOVisualCostants,
  ListItemHeader,
  ListItemSwitch,
  useIOToast,
  VSpacer
} from '@pagopa/io-app-design-system';
import { ComponentProps } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHeaderSecondLevel } from '../hooks/useHeaderSecondLevel';
import { IOScrollViewWithLargeHeader } from '../components/IOScrollViewWithLargeHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { resetLifecycle } from '../features/wallet/store/lifecycle';
import { preferencesReset } from '../store/reducers/preferences';
import {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from '../store/reducers/debug';
import AppVersion from '../components/AppVersion';

type TestButtonsListItem = Pick<
  ComponentProps<typeof IOButton>,
  'onPress' | 'label'
>;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const { t } = useTranslation('global');
  const dispatch = useAppDispatch();
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);

  const testButtonListItems: ReadonlyArray<TestButtonsListItem> = [
    {
      label: t('settings.reset.walletReset'),
      onPress: () => {
        dispatch(resetLifecycle());
        toast.success(t('generics.success'));
      }
    },
    {
      label: t('settings.reset.onboardingReset'),
      onPress: () => {
        dispatch(preferencesReset());
      }
    }
  ];

  const DebugSwitch = () => (
    <ListItemSwitch
      label={t('settings.debug')}
      value={isDebugModeEnabled}
      onSwitchValueChange={state => {
        dispatch(setDebugModeEnabled({ state }));
      }}
    />
  );

  useHeaderSecondLevel({
    title: ''
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('settings.title'),
        accessibilityLabel: t('settings.title')
      }}
    >
      <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
        <DebugSwitch />
        {isDebugModeEnabled && (
          <FlatList
            scrollEnabled={false}
            data={testButtonListItems}
            renderItem={({ item }) => (
              <IOButton
                variant="solid"
                label={item.label}
                onPress={item.onPress}
                fullWidth
              />
            )}
            ListHeaderComponent={
              <ListItemHeader label={t('settings.reset.title')} />
            }
            ItemSeparatorComponent={() => <VSpacer />}
          />
        )}
        <AppVersion />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
