/**
 * Routes definition for {@link CredentialIssuanceNavigator}.
 */
const CREDENTIAL_ISSUANCE_ROUTES = {
  ALREADY_OBTAINED: 'CREDENTIAL_ISSUANCE_ALREADY_OBTAINED',
  FAILURE: 'CREDENTIAL_ISSUANCE_FAILURE',
  INTRODUCTION: 'CREDENTIAL_ISSUANCE_INTRODUCTION',
  LIST: 'CREDENTIAL_ISSUANCE_LIST',
  // Landing for credential offer (OID4VCI) deep links / QR codes: resolves the
  // offer and starts the credential issuance flow.
  OFFER: 'CREDENTIAL_ISSUANCE_OFFER',
  PREVIEW: 'CREDENTIAL_ISSUANCE_PREVIEW',
  TRUST: 'CREDENTIAL_ISSUANCE_TRUST'
} as const;

export default CREDENTIAL_ISSUANCE_ROUTES;
