# @io-eudiw-app/debug-info

Development utility library. Provides a toggleable debug mode with an on-screen overlay for inspecting arbitrary runtime data. Disabled by default and intended for development and testing builds only.

---

## Public API

### Reducer

```ts
import { debugReducer } from '@io-eudiw-app/debug-info';

combineReducers({
  ...debugReducer, // mounts under the 'debug' key
});
```

### Actions

| Action | Description |
|---|---|
| `setDebugModeEnabled({ state: boolean })` | Toggles debug mode |
| `setDebugData(Record<string, unknown>)` | Merges key-value pairs into the debug data store |
| `resetDebugData(Array<string>)` | Removes specific keys from the debug data store |

### Selectors

| Selector | Returns |
|---|---|
| `selectIsDebugModeEnabled(state)` | `boolean` |
| `selectDebugData(state)` | `Record<string, unknown>` |

### Components

`DebugInfoOverlay` — floating overlay that renders all current debug data. Mount it near the root of the app, gated on `selectIsDebugModeEnabled`.

### Hook

`useDebugInfo()` — returns a setter function to write debug data from any component.

```ts
const setDebugInfo = useDebugInfo();
setDebugInfo({ lastAuthResponse: responsePayload });
```

---
