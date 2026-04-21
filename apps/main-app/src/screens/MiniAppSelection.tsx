import {
  H2,
  VSpacer,
  Body,
  ListItemNav,
  ListItemHeader
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

type MiniAppOption = {
  id: AvailableMiniAppId;
  label: string;
};

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
      label: t('global:miniAppSelection.miniApps.it-wallet')
    }
  ];

  return (
    <IOScrollView>
      <H2>{t('global:miniAppSelection.title')}</H2>
      <VSpacer size={8} />
      <Body>{t('global:miniAppSelection.subtitle')}</Body>
      <VSpacer size={24} />
      {availableMiniApps.map(app => (
        <>
          <ListItemHeader label="App Disponibili" />
          <ListItemNav
            key={app.id}
            value={app.label}
            onPress={() => onSelect(app.id)}
          />
        </>
      ))}
    </IOScrollView>
  );
};

export default MiniAppSelection;
