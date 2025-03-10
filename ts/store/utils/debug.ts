import {store} from '..';
import {resetDebugData, setDebugData} from '../reducers/debug';

/**
 * The purpose of this module is to add stronger typing to the debugging of sagas: being that
 * the collection of debug info must happen across the sagas, but such info's removal happens
 * in a single point, by registering every debug variable one wants to add in the types above
 * and using the helper methods here defined, it is ensured that every variable is tracked down
 * and, as a consequence, all variables are correctly removed
 */


/*
*************************** TYPES FOR CAPTURING STARTUP SAGA DEBUG INFO *****************************
*/

/**
 * Type that acts as a registry of all the variables a user wants to monitor
 * Every new variable should be added to this type to enforce a stronger control on serializaiton
 */
type StartupDebugInfo = {
  /**
   * This variable tracks the status of the {@link getBiometricsType} util method.
   * It captures whether or not the promise has been resolved and the resolution value.
   */
  isSensorAvailable?: string | undefined;
  /**
   * This variable tracks the status of the {@link hasDeviceScreenLock} util method.
   * It captures whether or not the promise has been resolved and the resolution value.
   */
  hasScreenLockFunc?: unknown;
  /**
   * This variable tracks the identification status used in the {@link IdentificationModal} to
   * choose whether to display the identificaiton modal or not.
   */
  identificationModalDisplayStatus?: string;
  /**
   * This variable tracks the temination status of the {@link BootSplash\.hide} library method invocation
   * inside of the startIdentification subsaga.
   */
  startIdentificationBootSplashHideDone?: boolean;
  /**
   * This variable tracks the temination status of the {@link BootSplash\.hide} library method invocation
   * inside of the catch segment of the startup saga.
   */
  startupCatchSectionBootSplashHideDone?: boolean;
  /**
   * This variable tracks the status varuable used in the {@link RootStackNavigator} to
   * choose what should be displayed on screen (if the loading screen, an error screen or the main navigatior).
   */
  rootStackNavigatorStartupDone?: string;
  /**
   * This variable tracks the status of the {@link initI18n} util method.
   * It captures whether or not the promise has been resolved.
   */
  i18nInitialized?: boolean;
};

/**
 * This dummyInfo variable is used to extract a list of the keys of the {@link StartupDebugInfo} type
 * that will be used to clear all the variables watched when not needed anymore.
 * In order to make thi swork correctly, it is necessary to add an entry to this object for every
 * entry declared in {@link StartupDebugInfo}, even if it has been declared as optional.
 */
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

/**
 * Method to add entries of {@link StartupDebugInfo} to the debug watcher to be used inside of sagas.
 * @param fields a subset of the entries of the {@link StartupDebugInfo} type containing variables to be watched
 * @returns An action to be dispatched by the saga by the {@link put} mehtod.
 */
export function sagaRecordStartupDebugInfo(fields: StartupDebugInfo) {
  return setDebugData(fields);
}

/**
 * Method to add entries of {@link StartupDebugInfo} to the debug watcher to be used when the {@link useAppDispatch}
 * hook is not available.
 * @param fields a subset of the entries of the {@link StartupDebugInfo} type containing variables to be watched
 */
export function recordStartupDebugInfo(fields: StartupDebugInfo) {
  store.dispatch(setDebugData(fields));
}

/**
 * Method to clear all entries entries of {@link StartupDebugInfo} from the debug watcher.
 * hook is not available.
 */
export function clearStartupDebugInfo() {
  store.dispatch(resetDebugData(keys));
}
