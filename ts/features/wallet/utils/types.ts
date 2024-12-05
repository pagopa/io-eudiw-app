import {Credential} from '@pagopa/io-react-native-wallet';

export type ParsedCredential = Awaited<
  ReturnType<typeof Credential.Issuance.verifyAndParseCredential>
>['parsedCredential'];

/**
 * Type for each claim to be displayed.
 */
export type ClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

export type StoredCredential = {
  parsedCredential: ParsedCredential;
  credential: string;
  keyTag: string;
  credentialType: string;
};
