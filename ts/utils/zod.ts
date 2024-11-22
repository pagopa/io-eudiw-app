import * as z from 'zod';

export const configSchema = z.object({
  WALLET_PROVIDER_BASE_URL: z.string()
});
