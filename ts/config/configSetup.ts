import Config from 'react-native-config';
import * as z from 'zod';

/**
 * Zod schema for the configuration variables specified in the env files for runtime validation.
 */
export const configSchema = z.object({
  WALLET_PROVIDER_BASE_URL: z.string().url(),
  PID_PROVIDER_BASE_URL: z.string().url(),
  PID_REDIRECT_URI: z.string()
});

/**
 * This function checks the Config object to ensure that all required values are defined.
 * It must be called before any other code in the app.
 * If a required value is not defined or is in a wrong format, an error is thrown.
 */
export const checkConfig = () => configSchema.parse(Config);
