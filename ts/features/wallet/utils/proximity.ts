import {z} from 'zod';

/**
 * Schema for parsing a verifier request passed by the io-react-native-proximity library.
 */
export const VerifierRequest = z.object({
  isAuthenticated: z.boolean(),
  request: z.record(z.string(), z.record(z.string(), z.boolean()))
});

/**
 * Type for the verifier request.
 */
export type VerifierRequest = z.infer<typeof VerifierRequest>;
