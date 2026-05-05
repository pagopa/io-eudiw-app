import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from '@pagopa/io-app-design-system';
import { registerRootComponent } from 'expo';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { hydrateCredentialsThunk } from '@io-eudiw-app/it-wallet';
import { persistor, store } from './store';
import type { RootState } from './store/types';
import RootContainer from './screens/RootContainer';
import { IdentificationModalWrapper } from './components/IdentificationModalWrapper';
import initI18n from './i18n';

// Loads the credentials slice from secure storage before redux-persist
// hands the app over to the UI tree. This bypasses redux-persist for the
// credentials slice (it is no longer wrapped in a `persistReducer`) so the
// encoded SD-JWT/MDOC payloads never flow through the rehydration step.
const hydrateWalletCredentials = async () => {
  // The store is annotated as `EnhancedStore<AppRootState>` which erases
  // the thunk-aware dispatch signature; recover it via a cast so the
  // async thunk type-checks at the call site.
  const dispatch = store.dispatch as ThunkDispatch<
    RootState,
    unknown,
    UnknownAction
  >;
  await dispatch(hydrateCredentialsThunk());
};

require('@pagopa/react-native-nodelibs/globals');

void initI18n();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureHandlerContainer}>
      <SafeAreaProvider>
        <IODSExperimentalContextProvider isExperimentaEnabled={true}>
          <IONewTypefaceContextProvider>
            <IOThemeContextProvider theme={'light'}>
              <Provider store={store}>
                <PersistGate
                  loading={null}
                  persistor={persistor}
                  onBeforeLift={hydrateWalletCredentials}
                >
                  <ToastProvider>
                    <BottomSheetModalProvider>
                      <RootContainer />
                      <IdentificationModalWrapper />
                    </BottomSheetModalProvider>
                  </ToastProvider>
                </PersistGate>
              </Provider>
            </IOThemeContextProvider>
          </IONewTypefaceContextProvider>
        </IODSExperimentalContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureHandlerContainer: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  }
});

registerRootComponent(App);
