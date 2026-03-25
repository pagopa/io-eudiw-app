import wallet from '../../locales/it/wallet.json';
import { locales as common } from '@io-eudiw-app/commons';
import { Resource } from 'i18next';

export const rawResources = {
  wallet,
  common
} as const;

export const resources: Resource = {
  it: {
    wallet: rawResources.wallet
  }
};
