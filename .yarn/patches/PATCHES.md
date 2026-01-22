## Description

This file describes the reason for the patches applied.

### react-native-screen-brightness-npm-2.0.0-alpha-22c6aeb21e.patch
Created on **16/08/2021**

#### Reason:
- implementation 'androidx.core:core:1.+' not compatible with the new gradle settings used by react-native 0.64.2

### react-native-screenshot-prevent-npm-1.2.1-d115315590.patch

Created on **24/11/2025**

#### Reason:

- Patch to make the library ready for react-native new architecture

### mdoc-x5chain-verification-disable-temp.patch

Created on: **02/12/2025**

#### Reason

- The EUDIW app currently relies on a test issuer that does not provide a valid x5chain or a trusted root certificate (trust anchor).
- Because a valid x509CertRoot cannot yet be configured, the X509 chain verification fails during mDL credential verification.
- This patch temporarily disables the X509 chain verification step to unblock integration and end-to-end testing.
- Specifically, the patch comments out the verifyX5chain invocation in src/mdoc/index.ts, preventing the - verification failure caused by the missing certificate chain.
- As a result, verifyAndParseCredentialMDoc can proceed without requiring a configured x509CertRoot during development.

The following check is temporarily disabled:
// if (!x509CertRoot) {
// throw new IoWalletError("Missing x509CertRoot");
// }

### How to remove in the future:

- Once valid x5chain certificates and a trust anchor are available, restore the original verification logic: await verifyX5chain(x5chain, x509CertRoot);
- Remove the patch file from the patches/ directory.
- Remove this entry from patches.md.

### authorization-response-jwe-encryption.patch

Created on: **18/12/2025**

### Reason

- The OpenID for Verifiable Presentations (OID4VP) specification allows authorization responses to be encrypted (JWE) instead of signed (JWS), depending on the verifier configuration.
- Some credential verifiers advertise authorization_encrypted_response_alg and authorization_encrypted_response_enc parameters in their openid_credential_verifier metadata.
- The previous implementation always generated a signed JWT (JWS) authorization response using the Wallet Instance Attestation (WIA) crypto context.
- This caused interoperability issues with verifiers that expect an encrypted authorization response, as defined by their metadata and JWKS.
- Modifies completeUserAuthorizationWithFormPostJwtMode to pass issuerConf instead of relying on wiaCryptoContext.
- Refactors createAuthzResponsePayload to build a JSON payload and encrypt it as a JWE.
- Removes the dependency on signing (SignJWT) for this authorization response path.
- This ensures the wallet complies with verifier-declared encryption requirements and improves compatibility with OID4VP-compliant relying parties.

### How to remove or change in the future:

- Once refactored, remove this patch file from the patches/ directory.
- Remove this entry from patches.md.
