import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from '@pagopa/io-app-design-system';
import { registerRootComponent } from 'expo';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import IdentificationModal from './ts/screens/IdentificationModal';
import RootContainer from './ts/screens/RootContainer';
import { persistor, store } from './ts/store';
require('@pagopa/react-native-nodelibs/globals');

function App(): React.JSX.Element {
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
                      <IdentificationModal />
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
  }
});

registerRootComponent(App);
