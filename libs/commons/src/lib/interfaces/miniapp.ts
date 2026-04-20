import { ComponentType } from 'react';
import { Reducer, TypedStartListening } from '@reduxjs/toolkit';
import { PathConfigMap } from '@react-navigation/native';
import { LocaleResource } from '.';

/**
 * Contract that each mini-app library must satisfy in its public exports.
 *
 * A mini-app is a self-contained feature module that plugs into the host app
 * by providing its own Redux state slice, navigation tree, i18n resources,
 * deep-linking configuration and listener middleware.
 *
 * @example
 * ```ts
 * // libs/it-wallet/src/index.ts
 * import type { MiniApp } from '@io-eudiw-app/commons';
 *
 * const miniApp = {
 *   id: 'it-wallet',
 *   reducer: { wallet: walletRootReducer },
 *   resource,
 *   Navigator: MainStackNavigator,
 *   linkingSchemes: ['haip://', 'openid4vp://'],
 *   linkingConfig: walletLinkingConfig,
 *   addListeners: addWalletListeners,
 * } satisfies MiniApp<'it-wallet', 'wallet', WalletNavigatorParamsList>;
 * ```
 *
 * @template TId - A literal string that uniquely identifies this mini-app.
 * @template TReducerKey - The slice name used to mount the reducer in the store.
 * @template TNavigatorParamsList - The param list of the mini-app's nested navigator,
 *   used to type-check the deep-linking config.
 */
export interface MiniApp<
  TId extends string = string,
  TReducerKey extends string = string,
  TNavigatorParamsList extends Record<string, object | undefined> = Record<
    string,
    object | undefined
  >
> {
  /**
   * Unique identifier for this mini-app.
   *
   * Used to reference the mini-app in the preferences store and
   * anywhere else the host app needs to distinguish between mini-apps.
   */
  id: TId;

  /**
   * Reducer object to be spread into the host store's `combineReducers`.
   *
   * Must contain exactly one key matching the mini-app's slice name.
   *
   * @example
   * ```ts
   * export const walletReducer = { wallet: walletRootReducer };
   * //                             ^^^^^
   * //                             TReducerKey
   * ```
   */
  reducer: Record<TReducerKey, Reducer>;

  /**
   * i18n resource bundle in the i18next {@link Resource} format.
   *
   * Structure: `{ [language]: { [namespace]: translations } }`
   *
   * Resources are merged into the host app's i18n instance at startup
   * via `i18n.addResourceBundle()`.
   */
  resource: LocaleResource;

  /**
   * Root navigator component for this mini-app.
   *
   * The host app mounts this component inside its own navigation tree
   * when the mini-app's feature area becomes active.
   */
  Navigator: ComponentType;

  /**
   * URI scheme prefixes handled by this mini-app's deep-linking config.
   *
   * These are merged into the host `NavigationContainer`'s
   * `linking.prefixes` array.
   *
   * @example
   * ```ts
   * ['haip://', 'openid4vp://', 'eudi-openid4vp://']
   * ```
   */
  linkingSchemes: Array<string>;

  /**
   * Deep-link path configuration for the mini-app's navigator screens.
   *
   * Nested inside the host's linking config under the mini-app's
   * root route name.
   */
  linkingConfig: PathConfigMap<TNavigatorParamsList>;

  /**
   * Registers Redux listener-middleware side effects owned by this mini-app.
   *
   * Called once by the host app during startup with a typed
   * `startAppListening` function.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addListeners: (startAppListening: TypedStartListening<any, any>) => void;
}
