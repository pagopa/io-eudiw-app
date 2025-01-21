require('@pagopa/react-native-nodelibs/globals');
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
import IdentificationModal from './ts/screens/IdentificationModal';
import RootContainer from './ts/screens/RootContainer';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={IOStyles.flex}>
      <SafeAreaProvider>
        <IOThemeContextProvider theme={'light'}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <IODSExperimentalContextProvider isExperimentaEnabled={true}>
                <ToastProvider>
                  <BottomSheetModalProvider>
                    <RootContainer />
                    <IdentificationModal />
                  </BottomSheetModalProvider>
                </ToastProvider>
              </IODSExperimentalContextProvider>
            </PersistGate>
          </Provider>
        </IOThemeContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
export default App;
