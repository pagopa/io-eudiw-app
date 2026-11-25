import type { AccessTokenRequestAPTITUDE } from '@pagopa/io-wallet-oauth2';

import * as z from 'zod';

export type AuthorizationDetail = z.infer<typeof AuthorizationDetail>;

export type CredentialFormat = 'dc+sd-jwt' | 'mso_mdoc';

// The credential as a collection of attributes in plain value
export type ParsedCredential = Record<
  string,
  {
    name:
      | /* if i18n is provided */ Record<
          string /* locale */,
          string /* value */
        >
      | /* if no i18n is provided */ string
      | undefined; // Add undefined as a possible value for the name property
    value: unknown;
  }
>;

export const AuthorizationDetail = z.object({
  credential_configuration_id: z.string(),
  credential_identifiers: z.array(z.string()).min(1),
  type: z.literal('openid_credential')
});

export const StandardTokenResponse = z.object({
  access_token: z.string(),
  authorization_details: z.array(AuthorizationDetail).min(1).optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  token_type: z.string()
});

export const AuthDetailsBoundTokenResponse = StandardTokenResponse.extend({
  authorization_details: z.array(AuthorizationDetail).min(1)
});

export type AuthDetailsBoundTokenResponse = z.infer<
  typeof AuthDetailsBoundTokenResponse
>;
export type AuthorizeAccessTokenRequest = Extract<
  AccessTokenRequestAPTITUDE,
  | { grant_type: 'authorization_code' }
  | {
      grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code';
    }
> & {
  authorization_details?: readonly {
    credential_configuration_id: string;
    locations?: readonly string[];
    type: 'openid_credential';
  }[];
};

/** @deprecated Use AuthDetailsBoundTokenResponse for responses with required authorization details. */
export { AuthDetailsBoundTokenResponse as TokenResponse };

export type StandardTokenResponse = z.infer<typeof StandardTokenResponse>;
