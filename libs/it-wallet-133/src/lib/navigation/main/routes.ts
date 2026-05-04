/**
 * Routes definition for {@link MainStackNavigator}.
 */
const MAIN_ROUTES = {
  // Main section
  TAB_NAV: 'MAIN_TAB_NAV',
  WALLET_NAV: 'MAIN_WALLET_NAV',
  SETTINGS: {
    MAIN: 'MAIN_SETTINGS',
    PREFERENCES: {
      MAIN: 'MAIN_SETTINGS_PREFERENCES',
      APPEARANCE: 'MAIN_SETTINGS_PREFERENCES_APPEARANCE'
    }
  },
  SCAN_QR: 'MAIN_SCAN_QR',
  SHOW_QR: 'MAIN_SHOW_QR'
} as const;

export default MAIN_ROUTES;
