# @io-eudiw-app/it-wallet

Italian Digital Identity Wallet miniapp, as defined by the [IT-Wallet Technical Specification documentation v1.0.0](https://italia.github.io/eid-wallet-it-docs/releases/v1.0.0/en/index.html).

Exposed as a single `itWalletFeature` object that satisfies the [`MiniApp`](../commons/src/lib/interfaces/miniapp.ts) interface and plugs into `main-app`.

---

## Public API

```ts
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
```

`itWalletFeature` satisfies `MiniApp<'it-wallet', 'wallet', MainNavigatorParamsList>` and is the only export consumed by the host app. It also exports `ItWalletMiniAppId` (literal `'it-wallet'`) which the host app uses to build the `AvailableMiniAppId` union type. See the `main-app` [README](../../apps/main-app/README.md) for integration instructions.

---

## Supported credentials

| Credential | Type identifier | Format |
|---|---|---|
| Personal Identification Data (PID) | `urn:eu.europa.ec.eudi:pid:1` | `dc+sd-jwt` |
| Mobile Driving License (mDL) | `org.iso.18013.5.1.mDL` | `mso_mdoc` |
| European Disability Card | `urn:eu.europa.ec.eudi:edc:1` | `dc+sd-jwt` |

---
