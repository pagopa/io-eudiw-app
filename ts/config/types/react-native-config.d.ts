declare module 'react-native-config' {
  export interface NativeConfig {
    WALLET_PROVIDER_BASE_URL: string;
    PID_PROVIDER_BASE_URL: string;
    PID_REDIRECT_URI: string;
    PID_IDP_HINT: string;
    EAA_PROVIDER_BASE_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
