# main-app

`main-app` is the host Expo / React Native application that orchestrates all miniapps. It owns the top-level Redux store, the root navigation stack, the i18n instance and the startup lifecycle — but it deliberately contains no feature logic of its own. All features live in **miniapp libraries** (e.g. `libs/it-wallet`) that plug into the host through a single, well-defined contract: the [`MiniApp`](../../libs/commons/src/lib/interfaces/miniapp.ts) interface.

---

## Adding a new miniapp

### 1. Create the library

Use the Nx generator to scaffold the library. Run the following command from the repo root:

```sh
pnpm nx g @nx/expo:lib libs/my-feature
```

This creates the library folder, generates `package.json`, `tsconfig.json`, `tsconfig.lib.json`, and registers the project in `nx.json` automatically.

After the generator finishes, manually add the workspace protocol entry in **`pnpm-workspace.yaml`**:
```yaml
packages:
  # …existing entries…
  - 'libs/my-feature'
```

---

### 2. Implement the [`MiniApp`](../../libs/commons/src/lib/interfaces/miniapp.ts) interface

Every miniapp must export a single object that satisfies [`MiniApp<TReducerKey, TNavigatorParamsList>`](../../libs/commons/src/lib/interfaces/miniapp.ts) from `@io-eudiw-app/commons`.

```ts
// libs/my-feature/src/lib/interfaces/miniapp.ts (for reference)
export interface MiniApp<
  TReducerKey extends string,
  TNavigatorParamsList extends Record<string, object | undefined>
> {
  reducer: Record<TReducerKey, Reducer>;       // Redux slice(s)
  resource: LocaleResource;                    // i18n bundles
  Navigator: ComponentType;                    // Root navigator component
  linkingSchemes: Array<string>;               // Deep-link URI prefixes
  linkingConfig: PathConfigMap<TNavigatorParamsList>; // Deep-link path map
  addListeners: (startAppListening: TypedStartListening<any, any>) => void;
}
```

The subsections below explain each field.

#### 2a. Redux reducer

Create a combined reducer for the miniapp's state and expose it under a **single, unique key** — this key becomes the slice name in the host store.

```ts
// libs/my-feature/src/lib/store/index.ts
import { combineReducers } from '@reduxjs/toolkit';
import { mySliceReducer } from './mySlice';

export const myFeatureRootReducer = combineReducers({
  mySlice: mySliceReducer,
});
```

#### 2b. i18n resource

Return a `LocaleResource` object structured as `{ [language]: { [namespace]: translations } }`. At minimum, Italian (`it`) must be present.

```ts
// libs/my-feature/src/lib/i18n/index.ts
import it from '../../locales/it/my_feature.json';
import type { LocaleResource } from '@io-eudiw-app/commons';

export const resource: LocaleResource = {
  it: { my_feature: it },
};
```

Create an **`i18next.d.ts`** file alongside `index.ts` to give i18next full TypeScript awareness of your namespace inside the miniapp lib:

```ts
// libs/my-feature/src/lib/i18n/i18next.d.ts
import { resource as commonResource } from '@io-eudiw-app/commons';
import myFeatureIt from '../../locales/it/my_feature.json';

export type DefaultResource = typeof commonResource.it & {
  my_feature: typeof myFeatureIt;
};

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: DefaultResource;
    defaultNS: never;
  }
}
```

#### 2c. Navigator

Build a `@react-navigation/stack` (or equivalent) navigator and export it as a plain React component. Define route names in a dedicated `routes.ts` constant file.

```ts
// libs/my-feature/src/lib/navigation/main/routes.ts
const MY_FEATURE_ROUTES = {
  HOME: 'MY_FEATURE_HOME',
  DETAIL: 'MY_FEATURE_DETAIL',
} as const;

export default MY_FEATURE_ROUTES;
```

```tsx
// libs/my-feature/src/lib/navigation/main/MainStackNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import MY_FEATURE_ROUTES from './routes';
import HomeScreen from '../../screens/HomeScreen';
import DetailScreen from '../../screens/DetailScreen';

export type MainNavigatorParamsList = {
  [MY_FEATURE_ROUTES.HOME]: undefined;
  [MY_FEATURE_ROUTES.DETAIL]: { id: string };
};

const Stack = createStackNavigator<MainNavigatorParamsList>();

export const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={MY_FEATURE_ROUTES.HOME} component={HomeScreen} />
    <Stack.Screen name={MY_FEATURE_ROUTES.DETAIL} component={DetailScreen} />
  </Stack.Navigator>
);
```

To get correct typing for `useNavigation`, `Link`, refs, etc., augment the global `RootParamList` in a type declaration file inside your lib:

```ts
// libs/my-feature/src/lib/navigation/types/navigation.ts
import { MainNavigatorParamsList } from '../main/MainStackNavigator';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainNavigatorParamsList {}
  }
}
```

#### 2d. Deep-link schemes and config

```ts
export const LINKING_SCHEMES = ['myapp://', 'myapp-alt://'];

export const myFeatureLinkingConfig: PathConfigMap<MainNavigatorParamsList> = {
  [MY_FEATURE_ROUTES.DETAIL]: {
    path: 'detail/:id',
  },
};
```

#### 2e. Redux listeners

Listeners are Redux Toolkit listener-middleware effects that react to dispatched actions (e.g. background polling, navigation side effects).

```ts
// libs/my-feature/src/lib/middleware/index.ts
import type { TypedStartListening } from '@reduxjs/toolkit';

export const addMyFeatureListeners = (
  startAppListening: TypedStartListening<any, any>
) => {
  startAppListening({
    // … matcher / effect
  });
};
```

#### 2f. Public barrel export

Assemble all pieces in `src/index.ts` using the `satisfies` keyword to get compile-time verification against the [`MiniApp`](../../libs/commons/src/lib/interfaces/miniapp.ts) interface:

```ts
// libs/my-feature/src/index.ts
import type { MiniApp } from '@io-eudiw-app/commons';
import { myFeatureRootReducer } from './lib/store';
import { resource } from './lib/i18n';
import {
  LINKING_SCHEMES,
  MainNavigatorParamsList,
  MainStackNavigator,
  myFeatureLinkingConfig,
} from './lib/navigation/main/MainStackNavigator';
import { addMyFeatureListeners } from './lib/middleware';

export const myFeature = {
  reducer: { myFeature: myFeatureRootReducer },
  resource,
  Navigator: MainStackNavigator,
  linkingSchemes: LINKING_SCHEMES,
  linkingConfig: myFeatureLinkingConfig,
  addListeners: addMyFeatureListeners,
} satisfies MiniApp<'myFeature', MainNavigatorParamsList>;
```

---

### 3. Integrate into `main-app`

There are five integration points, each in a different file.

#### 3a. Add the workspace dependency

**`apps/main-app/package.json`**
```json
{
  "dependencies": {
    "@io-eudiw-app/my-feature": "workspace:*"
  }
}
```

Run `pnpm install` to link the package.

#### 3b. Inject the reducer into the Redux store

**`apps/main-app/src/store/index.ts`**
```ts
import { myFeature } from '@io-eudiw-app/my-feature';

// 1. Extend AppRootState
export type AppRootState = /* …existing types… */ & {
  myFeature: ReturnType<typeof myFeature.reducer.myFeature>;
};

// 2. Spread the reducer inside combineReducers
const combinedReducer = combineReducers({
  // …existing reducers…
  ...myFeature.reducer,
});
```

#### 3c. Register i18n resources

**`apps/main-app/src/i18n/index.ts`**
```ts
import { myFeature } from '@io-eudiw-app/my-feature';

const initI18n = async () => {
  await i18n.use(initReactI18next).init({ /* … */ });

  // …existing addResources calls…
  addResources(myFeature.resource);
};
```

Then extend the **main-app** type declaration to include the new namespace so that `useTranslation` and `t()` calls remain fully typed across the whole app:

**`apps/main-app/src/i18n/i18next.d.ts`**
```ts
import { myFeature } from '@io-eudiw-app/my-feature';

type DefaultResource = /* …existing types… */ &
  typeof myFeature.resource.it;  // ← add

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'global';
    resources: DefaultResource;
  }
}
```

#### 3d. Mount the navigator and wire deep-linking

Add a new root route constant and mount the miniapp's Navigator in `RootStackNavigator`.

**`apps/main-app/src/navigation/routes.tsx`**
```ts
const ROOT_ROUTES = {
  // …existing routes…
  MY_FEATURE_NAV: 'ROOT_MY_FEATURE_NAV',
} as const;
```

**`apps/main-app/src/navigation/RootStacknavigator.tsx`**
```ts
import { myFeature } from '@io-eudiw-app/my-feature';

// 1. Add the route to RootStackParamList
export type RootStackParamList = {
  // …existing routes…
  [ROOT_ROUTES.MY_FEATURE_NAV]: undefined;
};

// 2. Merge deep-link schemes and config
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    ...itWalletFeature.linkingSchemes,
    ...myFeature.linkingSchemes,       // ← add
  ],
  config: {
    screens: {
      // …existing screens…
      ROOT_MY_FEATURE_NAV: {
        screens: { ...myFeature.linkingConfig },  // ← add
      },
    },
  },
};

// TODO: decide which screens to mount inside getInitialScreen based on the
// startup flow for this miniapp.
const getInitialScreen = (): Screens => {
  switch (startupStatus) {
    case 'DONE':
      return {
        name: ROOT_ROUTES.MY_FEATURE_NAV,
        component: myFeature.Navigator,
      };
    // …other cases unchanged…
  }
};
```

#### 3e. Register Redux listeners during startup

**`apps/main-app/src/middleware/listener/startup.ts`**
```ts
import { myFeature } from '@io-eudiw-app/my-feature';

export const startupListener: AppListenerWithAction<UnknownAction> = async (
  _,
  listenerApi
) => {
  try {
    // …existing startup logic…

    itWalletFeature.addListeners(startAppListening);
    myFeature.addListeners(startAppListening);   // ← add
  } catch {
    // …
  }
};
```
