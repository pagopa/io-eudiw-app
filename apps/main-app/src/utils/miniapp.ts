import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import type { MiniApp } from '@io-eudiw-app/commons';
import { itWalletFeature133 } from '@io-eudiw-app/it-wallet-133';

/**
 * Registry that maps each available mini-app ID to its feature object.
 * Used by the startup listener and root navigator to dynamically resolve
 * the selected mini-app's Navigator, listeners, and linking config.
 *
 * When adding a new mini-app, add an entry here.
 */
export const miniAppRegistry: Record<string, MiniApp> = {
  [itWalletFeature.id]: itWalletFeature,
  [itWalletFeature133.id]: itWalletFeature133
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
