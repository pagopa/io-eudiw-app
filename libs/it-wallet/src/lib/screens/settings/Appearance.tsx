import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { preferencesFontSet, TypefaceChoice } from '@io-eudiw-app/preferences';
import {
  ListItemHeader,
  RadioGroup,
  useIONewTypeface,
  VStack
} from '@pagopa/io-app-design-system';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useAppDispatch } from '../../store';

/**
 * Display the appearance related settings
 * @param props
 * @constructor
 */
const Appearance = (): ReactElement => {
  const dispatch = useAppDispatch();
  const { newTypefaceEnabled, setNewTypefaceEnabled } = useIONewTypeface();
  const { t } = useTranslation(['common', 'wallet']);

  useHeaderSecondLevel({
    title: ''
  });

  const selectedTypeface: TypefaceChoice = newTypefaceEnabled
    ? 'comfortable'
    : 'standard';

  // Options for typeface
  const typefaceOptions = [
    {
      id: 'comfortable' as TypefaceChoice,
      value: t(
        'wallet:settings.preferences.appearance.typefaceStyle.comfortable.title'
      ),
      description: t(
        'wallet:settings.preferences.appearance.typefaceStyle.comfortable.description'
      )
    },
    {
      id: 'standard' as TypefaceChoice,
      value: t(
        'wallet:settings.preferences.appearance.typefaceStyle.standard.title'
      ),
      description: t(
        'wallet:settings.preferences.appearance.typefaceStyle.standard.description'
      )
    }
  ];

  const handleTypefaceChange = async (choice: TypefaceChoice) => {
    dispatch(preferencesFontSet(choice));
    setNewTypefaceEnabled(choice === 'comfortable');
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('wallet:settings.preferences.appearance.title')
      }}
      description={t('wallet:settings.preferences.appearance.description')}
      includeContentMargins
    >
      <VStack space={24}>
        <View>
          <ListItemHeader
            iconName="typeface"
            label={t(
              'wallet:settings.preferences.appearance.typefaceStyle.title'
            )}
          />
          <RadioGroup<TypefaceChoice>
            type="radioListItem"
            items={typefaceOptions}
            selectedItem={selectedTypeface}
            onPress={handleTypefaceChange}
          />
        </View>
      </VStack>
    </IOScrollViewWithLargeHeader>
  );
};

export default Appearance;
