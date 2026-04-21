import {
  IOButton,
  IOVisualCostants,
  ListItemHeader,
  ListItemSwitch,
  RadioGroup,
  useIONewTypeface,
  useIOToast,
  VSpacer
} from '@pagopa/io-app-design-system';
import { ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from '@io-eudiw-app/debug-info';
import { resetLifecycle } from '../store/lifecycle';
import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  preferencesFontSet,
  preferencesReset,
  TypefaceChoice
} from '@io-eudiw-app/preferences';

type TestButtonsListItem = Pick<
  ComponentProps<typeof IOButton>,
  'onPress' | 'label'
>;

/**
 * A screen to show all the options related to the user profile
 */

const Settings = () => {
  const toast = useIOToast();
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);
  const { newTypefaceEnabled, setNewTypefaceEnabled } = useIONewTypeface();

  const testButtonListItems: ReadonlyArray<TestButtonsListItem> = [
    {
      label: t('wallet:settings.reset.walletReset'),
      onPress: () => {
        dispatch(resetLifecycle());
        toast.success(t('common:generics.success'));
      }
    },
    {
      label: t('wallet:settings.reset.onboardingReset'),
      onPress: () => {
        dispatch(preferencesReset());
        toast.success(t('common:generics.success'));
      }
    }
  ];

  const DebugSwitch = () => (
    <ListItemSwitch
      label={t('wallet:settings.debug')}
      value={isDebugModeEnabled}
      onSwitchValueChange={state => {
        dispatch(setDebugModeEnabled({ state }));
      }}
    />
  );

  const FontRadioSelection = useCallback(() => {
    const typefaceOptions = [
      {
        id: 'comfortable' as TypefaceChoice,
        value: t('wallet:settings.appearance.typefaceStyle.comfortable.title'),
        description: t(
          'wallet:settings.appearance.typefaceStyle.comfortable.description'
        )
      },
      {
        id: 'standard' as TypefaceChoice,
        value: t('wallet:settings.appearance.typefaceStyle.standard.title'),
        description: t(
          'wallet:settings.appearance.typefaceStyle.standard.description'
        )
      }
    ];

    const selectedTypeface: TypefaceChoice = newTypefaceEnabled
      ? 'comfortable'
      : 'standard';

    const handleTypefaceChange = async (choice: TypefaceChoice) => {
      dispatch(preferencesFontSet(choice));
      setNewTypefaceEnabled(choice === 'comfortable');
    };

    return (
      <View>
        <ListItemHeader
          iconName="typeface"
          label={t('wallet:settings.appearance.typefaceStyle.title')}
        />
        <RadioGroup<TypefaceChoice>
          type="radioListItem"
          items={typefaceOptions}
          selectedItem={selectedTypeface}
          onPress={handleTypefaceChange}
        />
      </View>
    );
  }, [dispatch, newTypefaceEnabled, setNewTypefaceEnabled, t]);

  useHeaderSecondLevel({
    title: ''
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('wallet:settings.title'),
        accessibilityLabel: t('wallet:settings.title')
      }}
    >
      <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
        <FontRadioSelection />
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
              <ListItemHeader label={t('wallet:settings.reset.title')} />
            }
            ItemSeparatorComponent={() => <VSpacer />}
          />
        )}
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

export default Settings;
