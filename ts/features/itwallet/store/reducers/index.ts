import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import itwCreateCredentialsStorage from "../storages/itwCredentialStorage";
import itwWia, { ItwWiaState } from "./itwWiaReducer";
import itwCredentials, {
  ItwPersistedCredentialsState
} from "./itwPersistedCredentialsReducer";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycleReducer";
import itwPidReducer, { ItwIssuancePidState } from "./itwIssuancePidReducer";
import itwPrRemotePidReducer, {
  ItwPrRemotePidState
} from "./itwPrRemotePidReducer";
import itwPrRemoteCredentialReducer, {
  ItwPrRemoteCredentialState
} from "./itwPrRemoteCredentialReducer";
import itwIssuanceCredentialReducer, {
  ItwIssuanceCredentialState
} from "./itwIssuanceCredentialReducer";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;
const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 1;

export type ItWalletState = {
  /* GENERIC */
  lifecycle: ItwLifecycleState;
  wia: ItwWiaState;
  /* ISSUANCE */
  issuancePid: ItwIssuancePidState;
  issuanceCredential: ItwIssuanceCredentialState;
  /* PERSISTED CREDENTIALS */
  credentials: ItwPersistedCredentialsState & PersistPartial;
  /* PRESENTATION REMOTE */
  prRemotePid: ItwPrRemotePidState;
  prRemoteCredential: ItwPrRemoteCredentialState;
};

export type PersistedItWalletState = ItWalletState & PersistPartial;

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["lifecycle"]
};

const credentialsPersistConfig = {
  key: "credentials",
  storage: itwCreateCredentialsStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION
};

const reducers = combineReducers<ItWalletState, Action>({
  /* GENERIC */
  lifecycle: itwLifeCycle,
  wia: itwWia,
  /* ISSUANCE */
  issuancePid: itwPidReducer,
  issuanceCredential: itwIssuanceCredentialReducer,
  /* PERSISTED CREDENTIALS */
  credentials: persistReducer(credentialsPersistConfig, itwCredentials),
  /* PRESENTATION REMOTE */
  prRemotePid: itwPrRemotePidReducer,
  prRemoteCredential: itwPrRemoteCredentialReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
