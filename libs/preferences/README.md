# @io-eudiw-app/preferences

Manages user preferences that persist across app sessions. Exposed as a Redux slice injected into the host store via `preferencesReducer`.

---

## Public API

### Reducer

```ts
import { preferencesReducer } from '@io-eudiw-app/preferences';

combineReducers({
  ...preferencesReducer, // mounts under the 'preferences' key
});
```

### Actions

| Action | Description |
|---|---|
| `preferencesSetIsOnboardingDone()` | Marks the onboarding flow as completed |
| `preferencesSetIsBiometricEnabled(boolean)` | Enables or disables biometric unlock |
| `preferencesFontSet(TypefaceChoice)` | Sets the font size preference |
| `preferencesSetSelectedMiniAppId(string \| undefined)` | Sets the currently selected miniapp identifier |
| `preferencesResetMiniAppSelection` | Resets the selected miniapp to `undefined` |
| `preferencesReset()` | Resets the entire app state |

### Selectors

| Selector | Returns |
|---|---|
| `selectIsOnboardingComplete(state)` | `boolean` |
| `selectIsBiometricEnabled(state)` | `boolean` |
| `selectSessionId(state)` | `string` |
| `selectFontPreference(state)` | `TypefaceChoice` |
| `selectSelectedMiniAppId(state)` | `string \| undefined` |

---