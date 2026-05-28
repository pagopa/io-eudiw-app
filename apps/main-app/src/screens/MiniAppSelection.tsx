import {
  Body,
  H2,
  IOVisualCostants,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from '@pagopa/io-app-design-system';
import { ListRenderItem, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store';
import { preferencesSetSelectedMiniAppId } from '@io-eudiw-app/preferences';
import {
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { useCallback } from 'react';
import { ImageSourcePropType, ImageURISource } from 'react-native';

type MiniAppOption = {
  id: string;
  label: string;
  image: ImageURISource | ImageSourcePropType;
};

const MiniAppSelection = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global']);

  const onSelect = (id: string) => {
    dispatch(preferencesSetSelectedMiniAppId(id));
  };

  useHardwareBackButton(() => true);

  useHeaderSecondLevel({
    title: '',
    canGoBack: false
  });

  const availableMiniApps: Array<MiniAppOption> = [
    {
      id: itWalletFeature.id,
      label: t('global:miniAppSelection.miniApps.it-wallet'),
      image: require('../../assets/icons/it-wallet-mini-app.png')
    }
  ];

  // 1. Define the Header to keep the top content scrollable with the list
  const ListHeader = useCallback(
    () => (
      <>
        <H2>{t('global:miniAppSelection.title')}</H2>
        <VSpacer size={8} />
        <Body>{t('global:miniAppSelection.subtitle')}</Body>
        <VSpacer size={24} />
        <ListItemHeader label={t('global:miniAppSelection.available')} />
      </>
    ),
    [t]
  );

  // 2. Define the render logic for each item
  const renderItem: ListRenderItem<MiniAppOption> = ({ item }) => (
    <>
      <ModuleCredential
        label={item.label}
        image={item.image}
        onPress={() => onSelect(item.id)}
      />
      <VSpacer />
    </>
  );

  return (
    <FlatList
      data={availableMiniApps}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
    />
  );
};

export default MiniAppSelection;
