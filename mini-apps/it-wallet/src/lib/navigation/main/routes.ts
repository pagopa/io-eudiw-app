/**
 * Routes definition for {@link MainStackNavigator}.
 * Routes ending with `_NAV` are nested navigators, one for each flow.
 */
const MAIN_ROUTES = {
  CREDENTIAL_CARD_MODAL: 'MAIN_CREDENTIAL_CARD_MODAL',
  CREDENTIAL_DETAILS: 'MAIN_CREDENTIAL_DETAILS',
  CREDENTIAL_ISSUANCE_NAV: 'MAIN_CREDENTIAL_ISSUANCE_NAV',
  DEEP_LINK_ERROR: 'MAIN_DEEP_LINK_ERROR',
  // Centralized deep link / QR entry point which inspects the incoming URL
  // scheme and dispatches to the appropriate flow.
  DEEP_LINK_HANDLER: 'MAIN_DEEP_LINK_HANDLER',
  PID_ISSUANCE_NAV: 'MAIN_PID_ISSUANCE_NAV',
  PRESENTATION_NAV: 'MAIN_PRESENTATION_NAV',
  PROXIMITY_NAV: 'MAIN_PROXIMITY_NAV',
  SCAN_QR: 'MAIN_SCAN_QR',
  SETTINGS: {
    MAIN: 'MAIN_SETTINGS',
    PREFERENCES: {
      APPEARANCE: 'MAIN_SETTINGS_PREFERENCES_APPEARANCE',
      MAIN: 'MAIN_SETTINGS_PREFERENCES'
    },
    PROXIMITY: 'MAIN_SETTINGS_PROXIMITY'
  },
  TAB_NAV: 'MAIN_TAB_NAV',
  // Shared by the remote presentation and the credential offer flows
  WALLET_NOT_ACTIVE: 'MAIN_WALLET_NOT_ACTIVE'
} as const;

export default MAIN_ROUTES;
