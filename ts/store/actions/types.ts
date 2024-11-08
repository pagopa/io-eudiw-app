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
import { IdentificationActions } from "./identification";
import { PinSetActions } from "./pinset";
import { OnboardingActions } from "./onboarding";

export type Action =
  | ApplicationActions
  | DebugActions
  | StartupActions
  | PersistedPreferencesActions
  | AuthenticationActions
  | IdentificationActions
  | ItWalletActions
  | PinSetActions
  | OnboardingActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
