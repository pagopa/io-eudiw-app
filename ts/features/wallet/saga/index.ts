import {takeLatest} from 'typed-redux-saga';
import {setPidIssuanceFirstFlowRequest} from '../store/pidIssuance';
import {handleCreateInstance} from './handleCreateInstance';

/**
 * Main saga for the wallet feature.
 * New sagas related to the wallet which are triggered by actions should be added here.
 */
export function* walletSaga() {
  yield* takeLatest(setPidIssuanceFirstFlowRequest, handleCreateInstance);
}
