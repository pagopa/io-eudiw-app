/**
 * Constants for wallet routes.
 */
const WALLET_ROUTES = {
  PID_ISSUANCE: {
    INSTANCE_CREATION: 'INSTANCE_CREATION',
    ISSUANCE: 'ISSUANCE',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
  } as const
} as const;

export default WALLET_ROUTES;
