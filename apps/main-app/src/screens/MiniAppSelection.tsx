import {
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { preferencesSetSelectedMiniAppId } from '@io-eudiw-app/preferences';
import {
  Body,
  H2,
  IOVisualCostants,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItem } from 'react-native';
import { ImageSourcePropType, ImageURISource } from 'react-native';

import { useAppDispatch } from '../store';

type MiniAppOption = {
  id: string;
  image: ImageSourcePropType | ImageURISource;
  label: string;
};

const MiniAppSelection = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global']);

  const onSelect = (id: string) => {
    dispatch(preferencesSetSelectedMiniAppId(id));
  };

  useHardwareBackButton(() => true);

  useHeaderSecondLevel({
    canGoBack: false,
    title: ''
  });

  const availableMiniApps: MiniAppOption[] = [
    {
      id: itWalletFeature.id,
      image: require('../../assets/icons/it-wallet-mini-app.png'),
      label: t('global:miniAppSelection.miniApps.it-wallet')
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
        image={item.image}
        label={item.label}
        onPress={() => onSelect(item.id)}
      />
      <VSpacer />
    </>
  );

  return (
    <FlatList
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={availableMiniApps}
      keyExtractor={item => item.id}
      ListHeaderComponent={ListHeader}
      renderItem={renderItem}
    />
  );
};

export default MiniAppSelection;
