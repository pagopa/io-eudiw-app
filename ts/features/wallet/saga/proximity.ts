import {call, put, select, take, takeLatest} from 'typed-redux-saga';
import {
  parseVerifierRequest,
  Proximity,
  VerifierRequest
} from '@pagopa/io-react-native-proximity';
import {serializeError} from 'serialize-error';
import {
  addProximityLog,
  resetProximityLog,
  resetProximityQrCode,
  selectProximityDocumentRequest,
  setProximityQrCode,
  setProximityStatusAuthorizationComplete,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationStarted,
  setProximityStatusError,
  setProximityStatusReceivedDocument,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../store/proximity';
import {requestBlePermissions} from '../utils/permissions';
import {store} from '../../../store';
import {generateAcceptedFields} from '../utils/proximity';
import {selectCredential} from '../store/credentials';
import {wellKnownCredential} from '../utils/credentials';

// These are to aid typescript
const PROXIMITY_ON_DEVICE_CONNECTED: Proximity.Events = 'onDeviceConnected';
const PROXIMITY_ON_DEVICE_CONNECTING: Proximity.Events = 'onDeviceConnecting';
const PROXIMITY_ON_DEVICE_DISCONNECTED: Proximity.Events =
  'onDeviceDisconnected';
const PROXIMITY_ON_DOCUMENT_REQUEST_RECEIVED: Proximity.Events =
  'onDocumentRequestReceived';
const PROXIMITY_ON_ERROR: Proximity.Events = 'onError';

// Beginning of the saga
export function* watchProximitySaga() {
  yield* takeLatest([setProximityStatusStarted], proximityPresentation);
}

function* proximityPresentation() {
  try {
    yield* put(resetProximityLog());
    const permissions = yield* call(requestBlePermissions);
    if (!permissions) {
      throw new Error('Permissions not granted');
    }
    yield* put(
      addProximityLog('[INIT_PROXIMITY] Closing previous flow if any')
    );
    yield* call(async () => {
      await Proximity.close().catch(() => {});
    }); // We can ignore errors here as we don't know if the flow started successfully previously
    yield* call(Proximity.start);
    yield* put(resetProximityLog());
    yield* put(addProximityLog('[INIT_PROXIMITY] Flow started successfully'));
    // Register listeners
    yield* call(() => {
      Proximity.addListener('onDeviceConnecting', () => {});
    });
    yield* call(() => {
      Proximity.addListener('onDeviceConnected', () => {});
    });
    yield* call(() => {
      Proximity.addListener('onDocumentRequestReceived', payload => {
        // A new request has been received
        if (!payload || !payload.data) {
          store.dispatch(setProximityStatusError());
          return;
        }

        // Parse and verify the received request with the exposed function
        const parsedJson = JSON.parse(payload.data);
        const parsedRequest = parseVerifierRequest(parsedJson);
        store.dispatch(setProximityStatusReceivedDocument(parsedRequest));
      });
    });
    yield* call(() => {
      Proximity.addListener('onDeviceDisconnected', () => {
        store.dispatch(setProximityStatusStopped());
      });
    });
    yield* call(() => {
      Proximity.addListener('onError', () => {
        store.dispatch(setProximityStatusError());
      });
    });

    // Set QR Code
    const qrCode = yield* call(Proximity.getQrCodeString);
    yield* put(setProximityQrCode(qrCode));

    // Take a state update
    const action = yield* take([
      setProximityStatusError,
      setProximityStatusStopped,
      setProximityStatusReceivedDocument
    ]);

    if (setProximityStatusReceivedDocument.match(action)) {
      const documentRequest = yield* select(selectProximityDocumentRequest);
      if (!documentRequest || !documentRequest.request) {
        throw new Error('Proximity error: no credential found');
      }

      yield* call(handleProximityResponse, documentRequest);
    }
  } catch (e) {
    yield* put(addProximityLog(`[INIT_PROXIMITY] error: ${serializeError(e)}`));
    yield* call(closeFlow); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
  }
}

function* handleProximityResponse(documentRequest: VerifierRequest) {
  yield* put(setProximityStatusAuthorizationStarted());

  const choice = yield* take([
    setProximityStatusAuthorizationComplete,
    setProximityStatusAuthorizationRejected
  ]);

  if (setProximityStatusAuthorizationComplete.match(choice)) {
    const mdl = yield* select(
      selectCredential(wellKnownCredential.DRIVING_LICENSE)
    );
    if (mdl) {
      const documents: Array<Proximity.Document> = [
        {
          alias: mdl.keyTag,
          docType: mdl.credentialType,
          issuerSignedContent: mdl.credential
        }
      ];

      const acceptedFields = yield* call(
        generateAcceptedFields,
        documentRequest.request
      );

      const response = yield* call(
        Proximity.generateResponse,
        documents,
        acceptedFields
      );
      yield* call(Proximity.sendResponse, response);

      // yield* call(closeFlow);
    } else {
      throw new Error('Proximity: Credential not found');
    }
  } else {
    yield* call(closeFlow, true);
  }
}

function* closeFlow(sendError: boolean = false) {
  if (sendError) {
    yield* call(
      Proximity.sendErrorResponse,
      Proximity.ErrorCode.SESSION_TERMINATED
    );
  }
  yield* put(resetProximityQrCode());
  yield* call(Proximity.removeListener, PROXIMITY_ON_DEVICE_CONNECTED);
  yield* call(Proximity.removeListener, PROXIMITY_ON_DEVICE_CONNECTING);
  yield* call(Proximity.removeListener, PROXIMITY_ON_DEVICE_DISCONNECTED);
  yield* call(Proximity.removeListener, PROXIMITY_ON_DOCUMENT_REQUEST_RECEIVED);
  yield* call(Proximity.removeListener, PROXIMITY_ON_ERROR);
  yield* call(Proximity.close);

  if (sendError) {
    yield* put(setProximityStatusError());
  } else {
    yield* put(setProximityStatusStopped());
  }
}
