/**
 * Constants for wallet routes.
 */
const WALLET_ROUTES = {
  PID_ISSUANCE: {
    INSTANCE_CREATION: 'PID_ISSUANCE_INSTANCE_CREATION',
    REQUEST: 'PID_ISSUANCE_REQUEST',
    SUCCESS: 'PID_ISSUANCE_SUCCESS',
    FAILURE: 'PID_ISSUANCE_FAILURE'
  } as const,
  PRESENTATION: {
    CREDENTIAL_DETAILS: 'PRESENTATION_CREDENTIAL_DETAILS',
    PRE_DEFINITION: 'PRESENTATION_PRE_DEFINITION',
    POST_DEFINITION: 'PRESENTATION_POST_DEFINITION',
    FAILURE: 'PRESENTATION_FAILURE',
    SUCCESS: 'PRESENTATION_SUCCESS'
  }
} as const;

export default WALLET_ROUTES;
