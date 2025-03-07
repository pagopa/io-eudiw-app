import {store} from '..';
import {resetDebugData, setDebugData} from '../reducers/debug';

type StartupDebugInfo = {
  isSensorAvailable?: string | undefined;
  hasScreenLockFunc?: unknown;
  identificationModalDisplayStatus?: string;
  startIdentificationBootSplashHideDone?: boolean;
  startupCatchSectionBootSplashHideDone?: boolean;
  rootStackNavigatorStartupDone?: string;
  i18nInitialized?: boolean;
};

const dummyInfo: StartupDebugInfo = {
  isSensorAvailable: '',
  hasScreenLockFunc: '',
  identificationModalDisplayStatus: '',
  startIdentificationBootSplashHideDone: true,
  startupCatchSectionBootSplashHideDone: true,
  rootStackNavigatorStartupDone: '',
  i18nInitialized: true
};

const keys = Object.keys(dummyInfo);

export function sagaRecordStartupDebugInfo(fields: StartupDebugInfo) {
  return setDebugData(fields);
}

export function recordStartupDebugInfo(fields: StartupDebugInfo) {
  store.dispatch(setDebugData(fields));
}

export function clearStartupDebugInfo() {
  store.dispatch(resetDebugData(keys));
}
