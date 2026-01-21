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
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import I18n from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderSecondLevel } from '../hooks/useHeaderSecondLevel';
import { IOScrollViewWithLargeHeader } from '../components/IOScrollViewWithLargeHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { resetLifecycle } from '../features/wallet/store/lifecycle';
import {
  preferencesFontSet,
  preferencesReset,
  TypefaceChoice
} from '../store/reducers/preferences';
import {
  selectIsDebugModeEnabled,
  setDebugModeEnabled
} from '../store/reducers/debug';
import AppVersion from '../components/AppVersion';
import { FONT_PERSISTENCE_KEY } from '../context/DSTypeFaceContext';

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
  const { newTypefaceEnabled, setNewTypefaceEnabled } = useIONewTypeface();

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

  const FontRadioSelection = useCallback(() => {
    // Options for typeface
    const typefaceOptions = [
      {
        id: 'comfortable' as TypefaceChoice,
        value: I18n.t('settings.appearance.typefaceStyle.comfortable.title', {
          ns: 'global'
        }),
        description: I18n.t(
          'settings.appearance.typefaceStyle.comfortable.description',
          { ns: 'global' }
        )
      },
      {
        id: 'standard' as TypefaceChoice,
        value: I18n.t('settings.appearance.typefaceStyle.standard.title', {
          ns: 'global'
        }),
        description: I18n.t(
          'settings.appearance.typefaceStyle.standard.description',
          { ns: 'global' }
        )
      }
    ];

    const selectedTypeface: TypefaceChoice = newTypefaceEnabled
      ? 'comfortable'
      : 'standard';

    const handleTypefaceChange = (choice: TypefaceChoice) => {
      AsyncStorage.setItem(FONT_PERSISTENCE_KEY, choice).finally(() => {
        dispatch(preferencesFontSet(choice));
        setNewTypefaceEnabled(choice === 'comfortable');
      });
    };

    return (
      <View>
        <ListItemHeader
          iconName="typeface"
          label={I18n.t('settings.appearance.typefaceStyle.title', {
            ns: 'global'
          })}
        />
        <RadioGroup<TypefaceChoice>
          type="radioListItem"
          items={typefaceOptions}
          selectedItem={selectedTypeface}
          onPress={handleTypefaceChange}
        />
      </View>
    );
  }, [dispatch, newTypefaceEnabled, setNewTypefaceEnabled]);

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
