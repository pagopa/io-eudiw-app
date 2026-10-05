import {
  CredentialIssuance,
  RemotePresentation,
  SdJwt
} from '@pagopa/io-react-native-wallet';

import { ClaimDisplayFormat } from './itwRemotePresentationUtils';

export const enum CredentialFormat {
  LEGACY_SD_JWT = 'vc+sd-jwt',
  MDOC = 'mso_mdoc',
  SD_JWT = 'dc+sd-jwt'
}

export type ClaimDisplayResult =
  | { type: 'image'; value: string }
  | { type: 'text'; value: string | string[] };
/**
 * Type for disclosable claims.
 */
export type DisclosureClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

/**
 * Creates a type that can be either T with none of the properties from U, or U with none of the properties from T
 */
export type Either<T, U> = Only<T, U> | Only<U, T>;
export type EnrichedPresentationDetails = (Extract<
  ParsedDcql[number],
  { format: 'dc+sd-jwt' }
> & {
  claimsToDisplay: ClaimDisplayFormat[];
})[];

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = CredentialIssuance.IssuerConfig;

// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | 'expired'
  | 'expiring'
  | 'invalid'
  | 'unknown'
  | 'valid'
  | ItwJwtCredentialStatus;

// Digital credential status
export type ItwJwtCredentialStatus = 'jwtExpired' | 'jwtExpiring' | 'valid';

/**
 * Ensures that a type has all properties of T but none of the properties of U
 */
export type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

export type ParsedCredential = CredentialIssuance.ParsedCredential;

/**
 * Type representing the parsed DCQL query with the presentation details
 */
export type ParsedDcql = Awaited<
  ReturnType<RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']>
>;

export type PercentPosition = `${number}%`;

/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> = object & {
  [K in keyof T]: T[K];
};

/**
 * Full credential bundle: metadata together with the encoded credential.
 * Used at issuance time and whenever a consumer needs the encoded JWT/MDOC
 * after retrieving it from the vault.
 */
export type StoredCredential = StoredCredentialMetadata & {
  credential: string;
};

/**
 * Metadata for a credential stored in the wallet. This is the portion that
 * lives in the Redux slice — it omits the encoded SD-JWT/MDOC, which is
 * persisted separately by `CredentialsVault`.
 */
export type StoredCredentialMetadata = {
  credentialType: string;
  expiration: string;
  format: string;
  issuedAt?: string;
  issuerConf: IssuerConfiguration;
  keyTag: string;
  parsedCredential: ParsedCredential;
  spec_version?: string;
};

/**
 * Alias for the Verification type
 */
export type Verification = NonNullable<
  ReturnType<typeof SdJwt.getVerification>
>;

/**
 * A type guard that filters out undefined and null from a type T
 */
export function isDefined<T, O extends NonNullable<T>>(v: T): v is O {
  return v !== null && v !== undefined;
}
