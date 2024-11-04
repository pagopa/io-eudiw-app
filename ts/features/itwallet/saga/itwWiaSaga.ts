import { SagaIterator } from "redux-saga";
import { put, call, takeLatest } from "typed-redux-saga/macro";
import {
  Trust,
  WalletInstanceAttestation,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { toError } from "fp-ts/lib/Either";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { walletProviderBaseUrl } from "../../../config";
import {
  ITW_WIA_KEY_TAG,
  getOrGenerateCyptoKey
} from "../utils/itwSecureStorageUtils";

/**
 * Watcher for the IT wallet instance attestation related sagas.
 */
export function* watchItwWiaSaga(): SagaIterator {
  /**
   * Handles the wallet instance attestation issuing.
   */
  yield* takeLatest(itwWiaRequest.request, handleWiaRequest);
}

/*
 * This saga handles the wallet instance attestation issuing.
 * it tries to get the wallet instance attestation and dispatches the result.
 */
export function* handleWiaRequest(): SagaIterator {
  try {
    const entityConfiguration = yield* call(
      Trust.getWalletProviderEntityConfiguration,
      walletProviderBaseUrl
    );

    yield* call(getOrGenerateCyptoKey, ITW_WIA_KEY_TAG);
    const wiaCryptoContext = yield* call(
      createCryptoContextFor,
      ITW_WIA_KEY_TAG
    );
    const issuingAttestation = yield* call(
      WalletInstanceAttestation.getAttestation,
      { wiaCryptoContext }
    );
    const wia = yield* call(issuingAttestation, entityConfiguration);
    yield* put(itwWiaRequest.success(wia));
  } catch (e) {
    const { message } = toError(e);
    yield* put(
      itwWiaRequest.failure({
        code: ItWalletErrorTypes.WIA_ISSUANCE_ERROR,
        message
      })
    );
  }
}
