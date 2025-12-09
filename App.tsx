require('@pagopa/react-native-nodelibs/globals');

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {
  IODSExperimentalContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from '@pagopa/io-app-design-system';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {StyleSheet} from 'react-native';
import {persistor, store} from './ts/store';
import IdentificationModal from './ts/screens/IdentificationModal';
import RootContainer from './ts/screens/RootContainer';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.gestureHandlerContainer}>
      <SafeAreaProvider>
        <IODSExperimentalContextProvider isExperimentaEnabled={true}>
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
        </IODSExperimentalContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
export default App;

const styles = StyleSheet.create({
  gestureHandlerContainer: {
    flex: 1
  }
});
