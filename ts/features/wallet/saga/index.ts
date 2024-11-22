import {takeLatest} from 'typed-redux-saga';
import {setInstanceRequest} from '../store/pidIssuance';
import {handleCreateInstance} from './handleCreateInstance';

export function* walletSaga() {
  yield* takeLatest(setInstanceRequest, handleCreateInstance);
}
