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
  selectProximityAcceptedFields,
  selectProximityDocumentRequest,
  setProximityQrCode,
  setProximityStatusAuthorizationComplete,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationSend,
  setProximityStatusAuthorizationStarted,
  setProximityStatusConnected,
  setProximityStatusError,
  setProximityStatusReceivedDocument,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../store/proximity';
import {requestBlePermissions} from '../utils/permissions';
import {store} from '../../../store';
import {selectCredentials} from '../store/credentials';
import { ParsedCredential, StoredCredential } from '../utils/types';
import { CBOR } from '@pagopa/io-react-native-cbor';

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
      Proximity.addListener('onDeviceConnected', () => {
        store.dispatch(setProximityStatusConnected())
      });
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
  const allCredentials = yield* select(selectCredentials)
  const mdocCredentials = allCredentials.filter(credential => credential.format === 'mso_mdoc')
  const credentialDescriptor = yield* call(matchRequestToClaims, documentRequest, mdocCredentials)
  yield* put(setProximityStatusAuthorizationStarted(credentialDescriptor));

  const choice = yield* take([
    setProximityStatusAuthorizationSend,
    setProximityStatusAuthorizationRejected
  ]);

  if (setProximityStatusAuthorizationSend.match(choice)) {
    const documents: Array<Proximity.Document> = mdocCredentials.map(credential => (
      {
        alias: credential.keyTag,
        docType: credential.credentialType,
        issuerSignedContent: credential.credential
      }
    ));

    const acceptedFields = yield* select(selectProximityAcceptedFields)
    if (acceptedFields) {
      const response = yield* call(
        Proximity.generateResponse,
        documents,
        acceptedFields
      );
      yield* call(Proximity.sendResponse, response);
      yield* put(setProximityStatusAuthorizationComplete())
    } else {
      yield* call(closeFlow,true)
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

function* matchRequestToClaims(verifierRequest : VerifierRequest, credentialsMdoc : StoredCredential[]) {

    const decodedCredentials = yield* call(async () => await Promise.all(credentialsMdoc.map(async (credential) => {
        const decodedIssuerSigned = await CBOR.decodeIssuerSigned(credential.credential)
        return {
            ...credential,
            issuerSigned : decodedIssuerSigned
        }
    })))

    //Key: Credential type
    //Value : isAuthenticated + nameSpaces
    return Object.entries(verifierRequest.request).reduce((prev, [key, value]) => {
        const credential = decodedCredentials.find(credential => credential.credentialType === key)
        if (credential) {
            //Key : namespace
            //Value : attributes
            const foundNamespaces = Object.entries(value).filter(([key2, _]) => key2 !== 'isAuthenticated').reduce((prev3, [namespace, attributes]) => {
                const foundNamespace = Object.entries(credential.issuerSigned.nameSpaces).find(([ns]) => ns === namespace)
                if (foundNamespace) {
                    const foundAttributes = Object.keys(attributes).reduce((prev4, attribute) => {
                        if (credential.parsedCredential[attribute]) {
                            return {
                                ...prev4,
                                [attribute] : credential.parsedCredential[attribute]
                            }
                        }
                        return {...prev4}
                    }, {} as Record<string,ParsedCredential[string]>)
                    if (Object.keys(foundAttributes).length !== 0)
                        return {
                            ...prev3,
                            [namespace] : foundAttributes
                        }
                    else return {
                        ...prev3
                    }
                }
                return {...prev3}
            },{} as Record<string, Record<string, ParsedCredential[string]>>)
            if (Object.keys(foundNamespaces).length === 0) {
                return {...prev}
            } else {
                return {
                    ...prev,
                    [key] : foundNamespaces
                }
            }
        }
        return {
            ...prev
        }
    }, {} as Record<string, Record<string, Record<string, ParsedCredential[string]>>>)
}
