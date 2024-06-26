import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@pagopa/io-app-design-system";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LightModalProvider } from "./components/ui/LightModal";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <IODSExperimentalContextProvider isExperimentaEnabled>
        <IOThemeContextProvider theme={"light"}>
          <ToastProvider>
            <Provider store={store}>
              <PersistGate loading={undefined} persistor={persistor}>
                <BottomSheetModalProvider>
                  <LightModalProvider>
                    <RootContainer />
                  </LightModalProvider>
                </BottomSheetModalProvider>
              </PersistGate>
            </Provider>
          </ToastProvider>
        </IOThemeContextProvider>
      </IODSExperimentalContextProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
