## Description

This file describes the reason for the patches applied.

### @pagopa/io-react-native-wallet+1.7.1

Created on **11/07/2025**

#### Reason:

- The `x5c` field in the `Header` type was changed from `z.string()` to `z.array(z.string())` to accommodate multiple certificates in the SD-JWT header. This change
  will be implemented in the next version of the library and thus this patch can be removed once the library is updated.
