import type { MiniApp } from '@io-eudiw-app/commons';

import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { itWalletHsmFeature } from '@io-eudiw-app/it-wallet-hsm';

/**
 * Registry that maps each available mini-app ID to its feature object.
 * Used by the startup listener and root navigator to dynamically resolve
 * the selected mini-app's Navigator, listeners, and linking config.
 *
 * When adding a new mini-app, add an entry here.
 */
export const miniAppRegistry: Record<string, MiniApp> = {
  [itWalletFeature.id]: itWalletFeature,
  [itWalletHsmFeature.id]: itWalletHsmFeature
};

/**
 * Looks up a mini-app feature by its ID.
 * Returns `undefined` if the ID is not registered.
 */
export const getMiniAppById = (id?: string): MiniApp | undefined => {
  if (!id || !(id in miniAppRegistry)) {
    return undefined;
  }
  return miniAppRegistry[id];
};
