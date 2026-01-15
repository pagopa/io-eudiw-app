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
  format: 'vc+sd-jwt' | 'mso_mdoc' | 'dc+sd-jwt';
  // Commented out properties are to be re-added when their types are available
  // credentialId?: string;
  // issuerConf?: IssuerConfiguration; // The Wallet might still contain older credentials
  // storedStatusAssertion?: StoredStatusAssertion;
  // /**
  //  * The SD-JWT issuance and expiration dates in ISO format.
  //  * These might be different from the underlying document's dates.
  //  */
  // // TODO: [SIW-2740] This type needs to be rafactored once mdoc format will be available
  // jwt?: {
  //   expiration: string;
  //   issuedAt?: string;
  // };
};
