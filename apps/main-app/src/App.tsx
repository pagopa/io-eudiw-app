import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider,
} from '@pagopa/io-app-design-system';
import { registerRootComponent } from 'expo';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import initI18n from './i18n/i18n';
import { persistor, store } from './store';
import RootContainer from './screens/RootContainer';
import { IdentificationModal } from '@io-eudiw-app/identification';

require('@pagopa/react-native-nodelibs/globals');

function App(): React.JSX.Element {
  void initI18n();

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
    flex: 1,
  },
});

registerRootComponent(App);
