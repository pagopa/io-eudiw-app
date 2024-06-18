/**
 * Defines types for the available actions and store related stuff.
 */
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";
import { GlobalState } from "../reducers/types";
import { ItWalletActions } from "../../features/itwallet/store/actions";
import { ApplicationActions } from "./application";
import { DebugActions } from "./debug";
import { StartupActions } from "./startup";
import { PersistedPreferencesActions } from "./persistedPreferences";
import { AuthenticationActions } from "./authentication";
import { ProfileActions } from "./profile";

export type Action =
  | ApplicationActions
  | ProfileActions
  | DebugActions
  | StartupActions
  | PersistedPreferencesActions
  | AuthenticationActions
  | ItWalletActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
