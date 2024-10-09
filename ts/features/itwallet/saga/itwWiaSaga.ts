import { SagaIterator } from "redux-saga";
import { put, select, call, takeLatest } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import {
  Trust,
  WalletInstanceAttestation,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import DeviceInfo from "react-native-device-info";
import { toError } from "fp-ts/lib/Either";
import { idpSelector } from "../../../store/reducers/authentication";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { itwIsCIEAuthenticationSupported } from "../utils/itwCieUtils";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { walletProviderBaseUrl } from "../../../config";
import {
  WIA_KEYTAG,
  getOrGenerateCyptoKey
} from "../utils/itwSecureStorageUtils";
import {
  ensureIntegrityServiceIsReady,
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";

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
 * Currently it checks if the user logged in with CIE or if the device has NFC support.
 * Then it tries to get the wallet instance attestation and dispatches the result.
 */
export function* handleWiaRequest(): SagaIterator {
  const idp = yield* select(idpSelector);
  const hasLoggedInWithCie = isSome(idp) && idp.value.name === "cie";
  const isCieSupported = yield* call(itwIsCIEAuthenticationSupported);
  const isEmulator = yield* call(DeviceInfo.isEmulator);
  if (hasLoggedInWithCie || isCieSupported || isEmulator) {
    try {
      const entityConfiguration = yield* call(
        Trust.getWalletProviderEntityConfiguration,
        walletProviderBaseUrl
      );

      yield* call(getOrGenerateCyptoKey, WIA_KEYTAG);
      yield* call(ensureIntegrityServiceIsReady);
      const hardwareKeyTag = yield* call(generateIntegrityHardwareKeyTag);
      const integrityContext = getIntegrityContext(hardwareKeyTag);
      const wiaCryptoContext = yield* call(createCryptoContextFor, WIA_KEYTAG);
      const wia = yield* call(WalletInstanceAttestation.getAttestation, {
        wiaCryptoContext,
        integrityContext,
        walletProviderBaseUrl
      });
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
  } else {
    yield* put(
      itwWiaRequest.failure({
        code: ItWalletErrorTypes.NFC_NOT_SUPPORTED
      })
    );
  }
}
