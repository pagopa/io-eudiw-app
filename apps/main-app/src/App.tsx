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
import { persistor, store } from './store';
import RootContainer from './screens/RootContainer';
import { IdentificationModalWrapper } from './components/IdentificationModalWrapper';
import initI18n from './i18n';

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
                <PersistGate loading={null} persistor={persistor}>
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
