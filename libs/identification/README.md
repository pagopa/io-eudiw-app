# @io-eudiw-app/identification

Handles PIN and biometric authentication. Exposes a Redux slice and a modal component that gates access to sensitive features.

---

## Public API

### Reducer

```ts
import { identificationReducer } from '@io-eudiw-app/identification';

combineReducers({
  ...identificationReducer, // mounts under the 'identification' key
});
```

### Actions

| Action | Description |
|---|---|
| `setIdentificationStarted({ canResetPin, isValidatingTask })` | Opens the identification modal |
| `setIdentificationIdentified()` | Records a successful identification |
| `setIdentificationUnidentified()` | Records a failed or cancelled identification |
| `pinSet(pin: string)` | Stores the user PIN |

### Components

`IdentificationModal` — full-screen overlay that prompts the user for PIN or biometric. Mount it once near the root of the app, outside all navigators.

### Utilities

`getBiometricState()` — returns the current biometric capability and enrolment status of the device.

---

