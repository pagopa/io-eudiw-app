# @io-eudiw-app/env

Validates and exposes environment variables at runtime. Throws at startup if any required variable is missing or malformed.

---

## Required environment variables

| Variable | Format | Description |
|---|---|---|
| `EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL` | URL | Base URL of the Wallet Provider |
| `EXPO_PUBLIC_PID_PROVIDER_BASE_URL` | URL | Base URL of the PID Provider |
| `EXPO_PUBLIC_EAA_PROVIDER_BASE_URL` | URL | Base URL of the EAA credential issuer |
| `EXPO_PUBLIC_PID_REDIRECT_URI` | String | OAuth redirect URI for the PID issuance flow |

Define these in your `.env` file.

---

## Public API

### `initEnv()`

Call once during app startup before any feature reads environment values. Throws if the environment is invalid.

```ts
import { initEnv } from '@io-eudiw-app/env';

initEnv();
```

### `getEnv()`

Returns the validated and typed environment object. Must be called after `initEnv()`.

```ts
import { getEnv } from '@io-eudiw-app/env';

const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL } = getEnv();
```

---
