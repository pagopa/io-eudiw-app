import * as z from 'zod';

/**
 * 1. Define the Zod Schema
 */
const envSchema = z.object({
  EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: z.string().url(),
  EXPO_PUBLIC_PID_PROVIDER_BASE_URL: z.string().url(),
  EXPO_PUBLIC_EAA_PROVIDER_BASE_URL: z.string().url(),
  EXPO_PUBLIC_PID_REDIRECT_URI: z.string()
});

type Env = z.infer<typeof envSchema>;

const rawEnv = {
  EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL:
    process.env.EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL,
  EXPO_PUBLIC_PID_PROVIDER_BASE_URL:
    process.env.EXPO_PUBLIC_PID_PROVIDER_BASE_URL,
  EXPO_PUBLIC_EAA_PROVIDER_BASE_URL:
    process.env.EXPO_PUBLIC_EAA_PROVIDER_BASE_URL,
  EXPO_PUBLIC_PID_REDIRECT_URI: process.env.EXPO_PUBLIC_PID_REDIRECT_URI
};

let env: Env | null = null;

export const checkConfig = (): void => {
  if (env) {
    return;
  }
  const parsed = envSchema.safeParse(rawEnv);
  if (!parsed.success) {
    throw new Error('Invalid environment variables. Check your .env file.');
  }
  env = parsed.data;
};

export const getEnv = (): Env => {
  if (!env) {
    throw new Error(
      'Environment not validated. Call checkConfig() early in the app startup.'
    );
  }
  return env;
};
