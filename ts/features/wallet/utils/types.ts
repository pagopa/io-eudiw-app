import { Credential } from '@pagopa/io-react-native-wallet';

export type ParsedCredential = Awaited<
  ReturnType<typeof Credential.Issuance.verifyAndParseCredential>
>['parsedCredential'];

export type CredentialFormat = Awaited<
  ReturnType<typeof Credential.Issuance.obtainCredential>
>['format'];

/**
 * Type for each claim to be displayed.
 */
export type ClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

/**
 * Type for a credential which is stored in the wallet.
 */
export type StoredCredential = {
  parsedCredential: ParsedCredential;
  credential: string;
  keyTag: string;
  credentialType: string;
  format: 'vc+sd-jwt' | 'mso_mdoc';
};
