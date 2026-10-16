# @io-eudiw-app/it-wallet-hsm

Variant of the Italian Digital Identity Wallet miniapp (see [`@io-eudiw-app/it-wallet`](../it-wallet/README.md)), as defined by the [IT-Wallet Technical Specification documentation v1.0.0](https://italia.github.io/eid-wallet-it-docs/releases/v1.0.0/en/index.html).

This variant removes all credential-specific personalization: every credential card is rendered with a single, generic, neutral style instead of a per-credential color/gradient/overlay, and the card title shows the raw credential type/`vct` identifier instead of a looked-up, hard-coded display name.

Exposed as a single `itWalletHsmFeature` object that satisfies the [`MiniApp`](../commons/src/lib/interfaces/miniapp.ts) interface and plugs into `main-app` alongside `@io-eudiw-app/it-wallet`.

---

## Public API

```ts
import { itWalletHsmFeature } from '@io-eudiw-app/it-wallet-144';
```

`itWalletHsmFeature` satisfies `MiniApp<'it-wallet-144', 'itWalletHsm', MainNavigatorParamsList>` and is the only export consumed by the host app. See the `main-app` [README](../../apps/main-app/README.md) for integration instructions.

---

## Supported credentials

| Credential | Type identifier | Format |
|---|---|---|
| Personal Identification Data (PID) | `urn:eu.europa.ec.eudi:pid:1` | `dc+sd-jwt` |
| Mobile Driving License (mDL) | `org.iso.18013.5.1.mDL` | `mso_mdoc` |
| European Disability Card | `urn:eu.europa.ec.eudi:edc:1` | `dc+sd-jwt` |

---
