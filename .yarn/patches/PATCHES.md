## Description

This file describes the reason for the patches applied.

### mdoc-x5chain-verification-disable-temp.patch

Created on: **24/11/2025**

#### Reason

- The EUDIW app currently uses a test issuer that does not provide certificates or a trust anchor.
- Since we cannot yet configure a valid trust anchor, we are temporarily disabling the X509 chain verification step.
- This patch comments out the verifyX5chain call inside src/mdoc/index.ts, allowing integration and end-to-end testing of mDL documents.
- Without this patch, the verification step fails due to the missing certificate chain, blocking development.

### How to remove in the future:

- Once valid x5chain certificates are available, restore the original verification call:
  await verifyX5chain(x5chain, x509CertRoot);
- Remove the patch file from the patches/ directory.
- Remove this entry from patches.md.

### mdoc-x509-root-check-disable-temp.patch

Created on: **02/12/2025**

#### Reason

- The EUDIW app uses a test issuer that does not provide an X509 root certificate or a trust anchor.
- The function verifyAndParseCredentialMDoc normally requires a valid x509CertRoot to verify mDL credentials.
- Due to the missing root certificate, this check fails during development.
- To allow end-to-end testing of mDL credentials, this patch temporarily disables the mandatory x509CertRoot check by commenting out:

// if (!x509CertRoot) {
// throw new IoWalletError("Missing x509CertRoot");
// }

### How to remove in the future:

- Restore the original x509CertRoot validation block once a proper trust anchor becomes available.
- Remove the patch file from the patches/ directory.
- Delete this entry from patches.md.
