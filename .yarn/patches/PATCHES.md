## Description

This file describes the reason for the patches applied.

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
