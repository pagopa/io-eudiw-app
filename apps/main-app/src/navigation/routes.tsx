/**
 * Routes definition for the tab navigator.
 */
const ROOT_ROUTES = {
  ERROR: 'ROOT_ERROR',
  LOADING: 'ROOT_LOADING',
  // Main section
  MAIN_NAV: 'ROOT_MAIN_NAV',

  // Selected mini-app
  MINI_APP_NAV: 'ROOT_MINI_APP_NAV',

  // Mini-app selection
  MINI_APP_SELECTION: 'ROOT_MINI_APP_SELECTION',

  // Onboarding
  ONBOARDING_NAV: 'ROOT_ONBOARDING_NAV'
} as const;

export default ROOT_ROUTES;
