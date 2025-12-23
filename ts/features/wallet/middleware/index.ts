import {AppStartListening} from '../../../middleware/listener';
import {addPidWithIdentification} from '../store/credentials';
import {addCredentialListeners} from './credential';
import {addPidWithAuthListener} from './pid';

export const addWalletListeners = (startAppListening: AppStartListening) => {
  // Start listener for adding PID with authentication after the issuance flow
  startAppListening({
    actionCreator: addPidWithIdentification,
    effect: async (action, listenerApi) => {
      // Debounce in case of multiple actions dispatched (like a takeLatest)
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(15);
      await addPidWithAuthListener(action, listenerApi);
    }
  });

  // Start listener for credential issuance flow
  addCredentialListeners(startAppListening);
};
