import * as z from 'zod';

declare module 'react-native-config' {
  export interface NativeConfig {
    WALLET_PROVIDER_BASE_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

/**
 * Zod schema for the configuration variables specified in the env files for runtime validation.
 */
export const configSchema = z.object({
  WALLET_PROVIDER_BASE_URL: z.string()
});
