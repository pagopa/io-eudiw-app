import { WalletCombinedRootState } from '.';

/**
 * Select the wallet instance keytag.
 * @param state - The root state
 * @returns the wallet instance keytag
 */
export const selectInstanceKeyTag = (state: WalletCombinedRootState) =>
  state.itWalletHsm.instance.keyTag;

export const selectInstanceCreationStatus = (state: WalletCombinedRootState) =>
  state.itWalletHsm.instance.creation;

/**
 * Selects the session id of the wallet
 * @param state - The root state of the Redux store
 * @returns a randomly generated uuid
 */
export const selectSessionId = (state: WalletCombinedRootState) =>
  state.itWalletHsm.instance.sessionId;
