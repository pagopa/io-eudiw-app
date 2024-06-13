import { ItwActivationActions } from "./itwActivationActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions = ItwLifecycleActions | ItwActivationActions;
