import { Platform } from "react-native";

const realIsCIEAuthenticationSupported = true;
const mockIsCIEAuthenticationSupported = () => Promise.resolve(true);

const realIsNfcEnabled = () => true;
const mockIsNfcEnabled = () => Promise.resolve(true);

const realOpenNfcSettings = true;
const mockOpenNfcSettings = () => Promise.resolve();

const realLaunchCieID = true;
const mockLaunchCieID = () => Promise.reject("ops");

const test = Platform.OS !== "android";

export const itwIsCIEAuthenticationSupported = test
  ? mockIsCIEAuthenticationSupported
  : realIsCIEAuthenticationSupported;

export const itwIsNfcEnabled = test ? mockIsNfcEnabled : realIsNfcEnabled;
export const itwOpenNFCSettings = test
  ? mockOpenNfcSettings
  : realOpenNfcSettings;
export const itwLaunchCieID = test ? mockLaunchCieID : realLaunchCieID;
