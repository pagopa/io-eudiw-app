# @io-eudiw-app/navigation

Global navigation reference and type-safe imperative navigation helpers shared across all miniapp libraries.

---

## Public API

### `navigationRef`

Pass as the `ref` prop of the root `NavigationContainer` in `main-app`.

```ts
import { navigationRef } from '@io-eudiw-app/navigation';

<NavigationContainer ref={navigationRef} …>
```

### `isNavigationReady()`

Returns `true` when the `NavigationContainer` has mounted and the ref is ready for imperative calls.

```ts
import { isNavigationReady } from '@io-eudiw-app/navigation';

while (!isNavigationReady()) {
  await delay(125);
}
```

### `createSafeNavigator<ParamList>()`

Returns a type-safe navigator scoped to a specific param list. Navigation calls are silently dropped if the ref is not ready yet.

```ts
import { createSafeNavigator } from '@io-eudiw-app/navigation';
import { MainNavigatorParamsList } from './navigation/main/MainStackNavigator';

const MainNavigator = createSafeNavigator<MainNavigatorParamsList>();

MainNavigator.navigate('MY_FEATURE_HOME');
MainNavigator.navigateWithReset('MY_FEATURE_HOME');
```

---