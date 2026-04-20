/**
 * Routes definition for the tab navigator.
 */
const ROOT_ROUTES = {
  // Main section
  MAIN_NAV: 'ROOT_MAIN_NAV',
  ERROR: 'ROOT_ERROR',
  LOADING: 'ROOT_LOADING',

  // Onboarding
  ONBOARDING_NAV: 'ROOT_ONBOARDING_NAV',

  // Wallet
  IT_WALLET_NAV: 'ROOT_IT_WALLET_NAV'
} as const;

export default ROOT_ROUTES;
