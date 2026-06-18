## Description

This file describes the reason for the patches applied.

### @pagopa__io-react-native-wallet.patch

Created on: **18/06/2026**

#### Reason

This patch makes three independent changes, described below.

##### 1. Temporarily disable X509 certificate chain verification

- The EUDIW app currently relies on a test issuer that does not provide a valid x5chain or a trusted root certificate (trust anchor).
- Because a valid `x509CertRoot` cannot yet be configured, the X509 chain verification fails during mDL (mDoc) and SD-JWT credential verification.
- This patch temporarily disables the X509 chain verification step to unblock integration and end-to-end testing.
- Affected files:
  - `src/mdoc/index.ts`: removes the `x509CertRoot` parameter from `verify` and comments out the `verifyX509Chain(x5chain, x509CertRoot)` invocation.
  - `lib/typescript/mdoc/index.d.ts`: updates the compiled type declaration of `verify` to match (the `x509CertRoot` parameter is commented out).
  - `src/credential/issuance/common/06-verify-and-parse-credential.mdoc.ts`: removes the `x509CertRoot` parameter from `verifyCredentialMDoc`, calls `verifyMdoc(rawCredential)` without it, and comments out the `Missing x509CertRoot` guard in `verifyAndParseCredentialMDoc`.
  - `src/credential/issuance/common/06-verify-and-parse-credential.sdjwt.ts`: comments out the `Missing x509CertRoot` guard and the `verifyX509Chain(x5c, x509CertRoot)` call inside the `validateCertificateChain` block. (The `MissingX509CertsError` check that requires an `x5c` header to be present is left intact.)
- As a result, credential verification can proceed without requiring a configured `x509CertRoot` during development.

The following check is temporarily disabled:
// if (!x509CertRoot) {
// throw new IoWalletError("Missing x509CertRoot");
// }

##### 2. Use `credential_issuer` as the issuer identifier when obtaining a credential

- In `src/credential/issuance/v1.3.3/05-obtain-credential.ts`, the `issuerIdentifier` passed when requesting credentials is changed from `issuerConf.credential_endpoint` to `issuerConf.credential_issuer`.
- This makes the request use the issuer's identifier (the `credential_issuer` URL) rather than the credential endpoint URL, aligning the value sent to the issuer with what it expects.

##### 3. Temporarily disable the Android key attestation requirement for the Wallet Unit Attestation

- In `src/wallet-unit-attestation/v1.3.3/issuing.ts`, the check in `createKeyAttestationRequest` that throws on Android when no key attestation is present is commented out.
- Normally, on Android the generated key must carry a key attestation in order to request a Wallet Unit Attestation. This guard is disabled to unblock testing on devices/environments where a valid Android key attestation is not available.

The following check is temporarily disabled:
// if (Platform.OS === "android" && !attestation) {
// throw new IoWalletError(
// "Missing key attestation: on Android the generated key must have a key attestation to request a Wallet Unit Attestation"
// );
// }

### How to remove in the future:

- Run `pnpm patch-remove @pagopa/io-react-native-wallet`
- Remove this entry from patches.md.

### @pagopa__io-app-design-system.patch

Created on: **13/04/2026**

#### Reason

This patch fixes the touch issue on SVG buttons. It's caused by SVG stealing touch events or not properly calculating hit areas.

### How to remove in the future:

- This should be removed once the patch gets applied to the design system library.


