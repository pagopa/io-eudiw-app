## Description

This file describes the reason for the patches applied.

### mdoc-x5chain-verification-disable-temp.patch

Created on **24/11/2025**

#### Reason:

- Since we are using a test issuer for the EUDIW app, and the test issuer does not provide certificates or a trust anchor, we decided not to add a trust anchor. Instead, we are temporarily commenting out the verification step.
- Temporarily disables the verifyX5chain call inside src/mdoc/index.ts to allow the integration and testing of driver license (mDL) documents.
- At this stage we do not yet possess the valid certificate chain required for proper verification, causing the process to fail and blocking development.
- The patch ensures that the rest of the mDL flow can be tested end-to-end while waiting for the official certificates.

### How to remove in the future:

- Once the correct x5chain certificates are available, revert the change by restoring the original verification line: await verifyX5chain(x5chain, x509CertRoot);
- Remove this patch file from the project’s patches/ directory.
- Finally, delete this entry from patches.md, as it will no longer be required.

### mdoc-x509-root-check-disable-temp.patch

Created on **02/12/2025**

#### Reason:

- Since we are using a test issuer for the EUDIW app, and the test issuer does not provide certificates or a trust anchor, we decided not to add a trust anchor. Instead, we are temporarily commenting out the verification step.
- The function `verifyAndParseCredentialMDoc` requires a valid `x509CertRoot` to verify mDL credentials.
- Our current test issuer setup does **not** provide an x509 root certificate or a valid trust anchor, making the verification step fail during development.
- To allow the EUDIW app to continue end-to-end testing of mDL credentials, we have temporarily **disabled the mandatory `x509CertRoot` check** by commenting out:

  ```ts
  // if (!x509CertRoot) {
  //   throw new IoWalletError("Missing x509CertRoot");
  // }
  ```
