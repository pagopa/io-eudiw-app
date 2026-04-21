import type { ItWalletMiniAppId } from '@io-eudiw-app/it-wallet';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import type { MiniApp } from '@io-eudiw-app/commons';

/**
 * Union of all mini-app identifiers registered in the host application.
 *
 * Extend this type when adding new mini-apps:
 * ```ts
 * type AvailableMiniAppId = ItWalletMiniAppId | NewMiniAppId;
 * ```
 */
export type AvailableMiniAppId = ItWalletMiniAppId;

/**
 * Registry that maps each available mini-app ID to its feature object.
 * Used by the startup listener and root navigator to dynamically resolve
 * the selected mini-app's Navigator, listeners, and linking config.
 *
 * When adding a new mini-app, add an entry here.
 */
export const miniAppRegistry: Record<AvailableMiniAppId, MiniApp> = {
  [itWalletFeature.id]: itWalletFeature
};

/**
 * Looks up a mini-app feature by its ID.
 * Returns `undefined` if the ID is not registered.
 */
export const getMiniAppById = (id?: string) => {
  if (!id || !(id in miniAppRegistry)) {
    return undefined;
  } else {
    return miniAppRegistry[id as AvailableMiniAppId];
  }
};
