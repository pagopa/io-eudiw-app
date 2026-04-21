import { H2, VSpacer, Body, ListItemNav } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store';
import { preferencesSetSelectedMiniAppId } from '@io-eudiw-app/preferences';
import { IOScrollView } from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import type { AvailableMiniAppId } from '../types/miniapp';

type MiniAppOption = {
  id: AvailableMiniAppId;
  label: string;
  description: string;
};

const availableMiniApps: Array<MiniAppOption> = [
  {
    id: itWalletFeature.id,
    label: 'IT Wallet',
    description: 'Italian Digital Identity Wallet'
  }
];

const MiniAppSelection = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['global']);

  const onSelect = (id: AvailableMiniAppId) => {
    dispatch(preferencesSetSelectedMiniAppId(id));
  };

  return (
    <IOScrollView>
      <H2>{t('global:miniAppSelection.title')}</H2>
      <VSpacer size={8} />
      <Body>{t('global:miniAppSelection.subtitle')}</Body>
      <VSpacer size={24} />
      {availableMiniApps.map(app => (
        <ListItemNav
          key={app.id}
          value={app.label}
          description={app.description}
          onPress={() => onSelect(app.id)}
          accessibilityLabel={app.label}
        />
      ))}
    </IOScrollView>
  );
};

export default MiniAppSelection;
