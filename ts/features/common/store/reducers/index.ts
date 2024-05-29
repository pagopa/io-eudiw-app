import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import itwReducer, {
  PersistedItWalletState
} from "../../../itwallet/store/reducers";

export type FeaturesState = {
  itWallet: PersistedItWalletState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
  itWallet: itwReducer
});

const CURRENT_REDUX_FEATURES_STORE_VERSION = 1;

const persistConfig: PersistConfig = {
  key: "features",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FEATURES_STORE_VERSION,
  // we let each vertical manage its own lists by banning everything else
  whitelist: []
};

export const featuresPersistor = persistReducer<FeaturesState, Action>(
  persistConfig,
  rootReducer
);
