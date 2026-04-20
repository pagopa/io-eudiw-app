import type { ItWalletMiniAppId } from '@io-eudiw-app/it-wallet';

/**
 * Union of all mini-app identifiers registered in the host application.
 *
 * Extend this type when adding new mini-apps:
 * ```ts
 * type AvailableMiniAppId = ItWalletMiniAppId | NewMiniAppId;
 * ```
 */
export type AvailableMiniAppId = ItWalletMiniAppId;
