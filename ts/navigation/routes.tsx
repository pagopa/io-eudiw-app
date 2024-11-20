/**
 * Routes definition for every navigation. This is done here to avoid circular dependencies.
 * Each time a new route is added, it should be added here.
 */
const ROUTES = {
  // Main section
  MAIN_HOME: 'MAIN_HOME',
  MAIN_WALLET: 'MAIN_WALLET',
  MAIN_SCAN_QR: 'MAIN_SCAN_QR',
  MAIN_SHOW_QR: 'MAIN_SHOW_QR',
  MAIN_ERROR: 'MAIN_ERROR',
  MAIN_LOADING: 'MAIN_LOADING',
  MAIN_ONBOARDING: 'MAIN_ONBOARDING'
} as const;

export default ROUTES;
