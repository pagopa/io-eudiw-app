import { isDevEnv } from "./environment";

// if the app is running in dev env, add "http" to allow the dev-server usage
export const originSchemasWhiteList = [
  "https://*",
  "intent://*",
  "iologin://*",
  ...(isDevEnv ? ["http://*"] : [])
];
