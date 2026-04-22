import {
  H2,
  VSpacer,
  Body,
  ListItemHeader,
  ModuleCredential
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store';
import { preferencesSetSelectedMiniAppId } from '@io-eudiw-app/preferences';
import {
  IOScrollView,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import type { AvailableMiniAppId } from '../types/miniapp';
import { ImageSourcePropType, ImageURISource } from 'react-native';

type MiniAppOption = {
  id: AvailableMiniAppId;
  label: string;
  image: ImageURISource | ImageSourcePropType;
};

/**
 * Screen which contains the list of available mini-apps which can be mounted in the container app.
 * The actual logic is handled by a listener during the app startup process.
 */
const MiniAppSelection = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global']);

  const onSelect = (id: AvailableMiniAppId) => {
    dispatch(preferencesSetSelectedMiniAppId(id));
  };

  useHardwareBackButton(() => {
    return true;
  });

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

  return (
    <IOScrollView>
      <H2>{t('global:miniAppSelection.title')}</H2>
      <VSpacer size={8} />
      <Body>{t('global:miniAppSelection.subtitle')}</Body>
      <VSpacer size={24} />
      <ListItemHeader label="App Disponibili" />
      {availableMiniApps.map(app => (
        <ModuleCredential
          key={app.id}
          label={app.label}
          image={app.image}
          onPress={() => onSelect(app.id)}
        />
      ))}
    </IOScrollView>
  );
};

export default MiniAppSelection;
