/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {
  IODSExperimentalContextProvider,
  IOStyles,
  IOThemeContextProvider,
  ToastProvider
} from '@pagopa/io-app-design-system';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {persistor, store} from './ts/store';
import {RootStackNavigator} from './ts/navigation/RootStacknavigator';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={IOStyles.flex}>
      <IOThemeContextProvider theme={'light'}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <IODSExperimentalContextProvider isExperimentaEnabled={true}>
              <SafeAreaProvider>
                <ToastProvider>
                  <BottomSheetModalProvider>
                    <RootStackNavigator />
                  </BottomSheetModalProvider>
                </ToastProvider>
              </SafeAreaProvider>
            </IODSExperimentalContextProvider>
          </PersistGate>
        </Provider>
      </IOThemeContextProvider>
    </GestureHandlerRootView>
  );
}
export default App;
