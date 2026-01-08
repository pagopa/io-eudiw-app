import { Credential } from '@pagopa/io-react-native-wallet';

// Digital credential status
export type ItwJwtCredentialStatus = 'valid' | 'jwtExpired' | 'jwtExpiring';

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>['issuerConf'];

// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | 'unknown'
  | 'valid'
  | 'invalid'
  | 'expiring'
  | 'expired'
  | ItwJwtCredentialStatus;

/**
 * Alias for the ParsedStatusAssertion type
 */
export type ParsedStatusAssertion = Awaited<
  ReturnType<Credential.Status.VerifyAndParseStatusAssertion>
>['parsedStatusAssertion']['payload'];
