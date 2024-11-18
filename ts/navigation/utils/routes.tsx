/**
 * Routes definition for every navigation. This is done here to avoid circular dependencies.
 * Each time a new route is added, it should be added here.
 */
const ROUTES = {
  MAIN: {
    ONBOARDING: 'ONBOARDING',
    HOME: 'HOME',
    SCAN_QR: 'SCAN_QR',
    SHOW_QR: 'SHOW_QR'
  },
  ONBOARDING: {
    TEST: 'TEST'
  }
} as const;

export default ROUTES;
