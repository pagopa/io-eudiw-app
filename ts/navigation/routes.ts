const ROUTES = {
  // Ingress
  INGRESS: "INGRESS",

  // UNSUPPORTED_DEVICE
  UNSUPPORTED_DEVICE: "UNSUPPORTED_DEVICE",

  // Onboarding
  ONBOARDING: "ONBOARDING",
  ONBOARDING_TOS: "ONBOARDING_TOS",
  ONBOARDING_SHARE_DATA: "ONBOARDING_SHARE_DATA",
  ONBOARDING_PIN: "ONBOARDING_PIN",

  // Main
  MAIN: "MAIN",

  // IT Wallet
  ITWALLET_HOME: "IT_WALLET_HOME",

  // Scan
  QR_CODE_SCAN: "QR_CODE_SCAN",

  // Profile
  PROFILE_MAIN: "PROFILE_MAIN",

  // Used when the App is in background
  BACKGROUND: "BACKGROUND"
} as const;

export default ROUTES;
