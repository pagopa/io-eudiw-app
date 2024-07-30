// Main config file. Mostly read the configuration from .env files
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import Config from "react-native-config";
import { Second } from "@pagopa/ts-commons/lib/units";

export const environment: string = Config.ENVIRONMENT;

// Default pin for dev mode
export const defaultPin = "162534";

export const apiUrlPrefix: string = Config.API_URL_PREFIX;

// SPID Relay State
export const spidRelayState = Config.SPID_RELAY_STATE;

export const isDebugBiometricIdentificationEnabled =
  Config.DEBUG_BIOMETRIC_IDENTIFICATION === "YES";

/**
 * IT Wallet
 */
export const walletProviderBaseUrl: string = pipe(
  Config.IT_WALLET_WP_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://io-d-wallet-it.azurewebsites.net")
);

export const walletPidProviderUrl: string = pipe(
  Config.IT_WALLET_PID_PROVIDER_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://api.eudi-wallet-it-pid-provider.it")
);

export const walletCredentialProviderUrl: string = pipe(
  Config.IT_WALLET_CREDENTIAL_PROVIDER_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://api.eudi-wallet-it-issuer.it/rp")
);

// IT Wallet Feature Flag
export const itWalletEnabled = Config.IT_WALLET_ENABLED === "YES";

const DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S = 30;

export const backgroundActivityTimeout = pipe(
  parseInt(Config.BACKGROUND_ACTIVITY_TIMEOUT_S, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S)
) as Second;
