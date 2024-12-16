import {
  ButtonSolid,
  IOStyles,
  ListItemHeader,
  useIOToast,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {ComponentProps} from 'react';
import {FlatList, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useHeaderSecondLevel} from '../hooks/useHeaderSecondLevel';
import {IOScrollViewWithLargeHeader} from '../components/IOScrollViewWithLargeHeader';
import {useAppDispatch} from '../store';
import {Lifecycle, setLifecycle} from '../features/wallet/store/lifecycle';
import {preferencesReset} from '../store/reducers/preferences';

type TestButtonsListItem = Pick<
  ComponentProps<typeof ButtonSolid>,
  'onPress' | 'label'
>;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const {t} = useTranslation('global');
  const dispatch = useAppDispatch();

  const testButtonListItems: ReadonlyArray<TestButtonsListItem> = [
    {
      label: t('settings.listHeaders.test.walletReset'),
      onPress: () => {
        dispatch(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_OPERATIONAL}));
        toast.success(t('generics.success'));
      }
    },
    {
      label: t('settings.listHeaders.test.onboardingReset'),
      onPress: () => {
        dispatch(preferencesReset());
      }
    }
  ];

  useHeaderSecondLevel({
    title: ''
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('settings.title'),
        accessibilityLabel: t('settings.title')
      }}>
      <View style={IOStyles.horizontalContentPadding}>
        <FlatList
          scrollEnabled={false}
          data={testButtonListItems}
          renderItem={({item}) => (
            <ButtonSolid label={item.label} onPress={item.onPress} fullWidth />
          )}
          ListHeaderComponent={
            <ListItemHeader label={t('settings.listHeaders.test.title')} />
          }
          ItemSeparatorComponent={() => <VSpacer />}
        />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
