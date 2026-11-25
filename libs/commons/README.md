# @io-eudiw-app/commons

Shared foundation library. Provides the `MiniApp` contract, cross-cutting UI components, hooks, utilities, and async-state helpers.

---

## Public API

### `MiniApp` interface

The contract every miniapp library must satisfy. See [`src/lib/interfaces/miniapp.ts`](src/lib/interfaces/miniapp.ts) for the full definition.

```ts
import type { MiniApp } from '@io-eudiw-app/commons';

export const myFeature = {
  id: 'my-feature',
  // …
} satisfies MiniApp<'my-feature', 'myFeature', MyNavigatorParamsList>;
```

### `LocaleResource`

Extends `i18next`'s `Resource` type and enforces at least an `it` (Italian) language key. Used as the `resource` field in `MiniApp`.

### `AsyncStatusValues<T, E, S>`

Type for tracking the state of any asynchronous operation in a Redux store.

```ts
type AsyncStatusValues<T = undefined, E extends string = never, S extends string = never> = {
  error: { error: unknown; status: true; type: E } | { error: undefined; status: false };
  loading: boolean;
  success: { data?: T; status: true } | { status: false };
} & { step?: S }; // only when S is provided
```

- `T`: the data carried on success.
- `E`: optional string literal union discriminating the error (`type` is omitted when not provided).
- `S`: optional string literal union of the steps the operation goes through while loading, so the UI can react to its progress (`step` is omitted when not provided).

Factory helpers: `setInitial()`, `setLoading(step?)`, `setSuccess(data?)`, `setError(error, type?)`.

### Components

| Component | Description |
|---|---|
| `LoadingScreenContent` | Full-screen loading layout |
| `LoadingIndicator` | Inline activity indicator |
| `OperationResultScreenContent` | Success / failure result screen |
| `IOScrollView` | Scroll view with IO design-system insets |
| `IOScrollViewWithLargeHeader` | Scroll view with a collapsible large header |
| `IOScrollViewWithReveal` | Scroll view with a sticky reveal footer |
| `IOMarkdown` | Markdown renderer with custom rendering rules |

### Hooks

| Hook | Description |
|---|---|
| `usePreventScreenCapture()` | Blocks screenshots on sensitive screens |
| `useBottomSheet()` | Opens and controls a bottom sheet |
| `useHeaderSecondLevel()` | Configures the second-level navigation header |
| `useFooterActionsMargin()` | Computes the correct bottom margin for CTA buttons |
| `useDisableGestureNavigation()` | Disables swipe-back gesture on a screen |
| `useHardwareBackButton(handler)` | Intercepts the Android hardware back button |

### Utilities

| Module | Exports |
|---|---|
| `asyncStatus` | `AsyncStatusValues`, `setInitial`, `setLoading`, `setSuccess`, `setError` |
| `brightness` | Screen brightness helpers |
| `clipboard` | Read / write clipboard |
| `color` | Color manipulation utilities |
| `crypto` | Cryptographic helpers |
| `device` | Device info utilities |
| `string` | String formatting helpers |
| `url` | URL parsing and building |

### `secureStoragePersistor()`

Returns a `redux-persist` storage engine that stores data in encrypted, hardware-backed secure storage. Use this for any slice that holds sensitive data.

---
