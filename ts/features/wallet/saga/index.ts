import {takeLatest} from 'typed-redux-saga';
import {setInstanceRequest} from '../store/pidIssuance';
import {handleCreateInstance} from './handleCreateInstance';

/**
 * Main saga for the wallet feature.
 * New sagas related to the wallet which are triggered by actions should be added here.
 */
export function* walletSaga() {
  yield* takeLatest(setInstanceRequest, handleCreateInstance);
}
