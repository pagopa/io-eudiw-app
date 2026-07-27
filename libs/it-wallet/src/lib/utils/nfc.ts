import { CieUtils } from '@pagopa/io-react-native-cie';
import { Platform } from 'react-native';

/**
 * Checks if NFC is currently activated on the device.
 *
 * Android only: on iOS NFC cannot be disabled, so the check always resolves to
 * true. Note that `CieUtils.isNfcEnabled` cannot be used on iOS as it maps to
 * `NFCTagReaderSession.readingAvailable`, which is false unless the app ships
 * the CoreNFC reader entitlement (which this app does not need).
 * @returns A promise that resolves to true if NFC is on, or false otherwise.
 */
export const checkNfcActivation = async () =>
  Platform.OS === 'android' ? CieUtils.isNfcEnabled() : true;

/**
 * Opens the NFC settings page on the device.
 *
 * **Android only**
 */
export const openNfcPreferences = () => CieUtils.openNfcSettings();
