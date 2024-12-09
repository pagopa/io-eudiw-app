declare module 'react-native-config' {
  export interface NativeConfig {
    WALLET_PROVIDER_BASE_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
