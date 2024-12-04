/**
 * Constants for wallet routes.
 */
const WALLET_ROUTES = {
  PID_ISSUANCE: {
    INSTANCE_CREATION: 'INSTANCE_CREATION',
    AUTHENTICATION: 'AUTHENTICATION',
    RESULT_ERROR: 'RESULT_ERROR'
  } as const
} as const;

export default WALLET_ROUTES;
