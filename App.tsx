/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {
  IODSExperimentalContextProvider,
  IOStyles,
  ToastProvider
} from '@pagopa/io-app-design-system';
import {persistor, store} from './ts/store';
import {MainStackNavigator} from './ts/navigation/MainStackNavigator';

function App(): React.JSX.Element {
  React.useEffect(() => {
    BootSplash.hide({fade: true}).finally(() => void 0);
  }, []);

  return (
    <GestureHandlerRootView style={IOStyles.flex}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <IODSExperimentalContextProvider isExperimentaEnabled={true}>
            <SafeAreaProvider>
              <ToastProvider>
                <MainStackNavigator />
              </ToastProvider>
            </SafeAreaProvider>
          </IODSExperimentalContextProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
export default App;
