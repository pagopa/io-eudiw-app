/**
 * Constants for wallet routes.
 */
const WALLET_ROUTES = {
  PID_ISSUANCE: {
    DISCOVERY: 'DISCOVERY',
    STRONG_AUTHENTICATION: 'STRONG_AUTHENTICATION',
    RESULT_ERROR: 'RESULT_ERROR'
  } as const
} as const;

export default WALLET_ROUTES;
