import { rawResources as itWalletRawResources } from '@io-eudiw-app/it-wallet';
import global from '../../locales/it/global.json';
import { commonRawResources } from '@io-eudiw-app/commons';

const rawResources = {
  itWalletRawResources,
  global,
  common: commonRawResources
} as const;

export default rawResources;
