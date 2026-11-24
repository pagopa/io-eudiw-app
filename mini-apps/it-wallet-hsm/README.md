# @io-eudiw-app/it-wallet-hsm

IT-Wallet HSM miniapp, initially copied from IT-Wallet (1.4.6), as defined by the [IT-Wallet Technical Specification documentation v1.0.0](https://italia.github.io/eid-wallet-it-docs/releases/v1.0.0/en/index.html).

Exposed as a single `itWalletHsmFeature` object that satisfies the [`MiniApp`](../../libs/commons/src/lib/interfaces/miniapp.ts) interface and plugs into `main-app`.

---

## Public API

```ts
import { itWalletHsmFeature } from '@io-eudiw-app/it-wallet-hsm';
```

`itWalletHsmFeature` satisfies `MiniApp<'it-wallet-hsm', 'hsm', MainNavigatorParamsList>` and is the only export consumed by the host app. See the `main-app` [README](../../apps/main-app/README.md) for integration instructions.

---

## Supported credentials

| Credential | Type identifier | Format |
|---|---|---|
| Personal Identification Data (PID) | `urn:eu.europa.ec.eudi:pid:1` | `dc+sd-jwt` |
| Mobile Driving License (mDL) | `org.iso.18013.5.1.mDL` | `mso_mdoc` |
| European Disability Card | `urn:eu.europa.ec.eudi:edc:1` | `dc+sd-jwt` |

---
