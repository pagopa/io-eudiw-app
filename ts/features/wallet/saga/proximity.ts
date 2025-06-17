import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
import {
  AcceptedFields,
  parseVerifierRequest,
  Proximity,
  VerifierRequest
} from '@pagopa/io-react-native-proximity';
import {serializeError} from 'serialize-error';
import {CBOR} from '@pagopa/io-react-native-cbor';
import {
  addProximityLog,
  resetProximity,
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
import {ParsedCredential, StoredCredential} from '../utils/types';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';

// Beginning of the saga
export function* watchProximitySaga() {
  yield* takeLatest([setProximityStatusStarted], proximityPresentation);
}

/**
 * Saga that handles the state of a proximity presentation
 */
function* proximityPresentation() {
  try {
    // First thing, we request BLE permissions and we setup the proximity handler
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
    // Registering proximity events listeners
    yield* call(() => {
      Proximity.addListener('onDeviceConnecting', () => {});
    });
    yield* call(() => {
      Proximity.addListener('onDeviceConnected', () => {
        store.dispatch(setProximityStatusConnected());
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

    /**
     * Being that the device can be disconnected or the connection be lost
     * during the flow, we create this race condition that closes the flow
     * in case of error. Resetting the proxity state is up to the pages
     * that reset the navigation
     */
    yield* race({
      task: call(handleProximityResponse),
      cancel: call(function* () {
        yield* take([setProximityStatusStopped, setProximityStatusError]);
        yield* call(closeFlow);
      })
    });
  } catch (e) {
    yield* put(addProximityLog(`[INIT_PROXIMITY] error: ${serializeError(e)}`));
    yield* call(closeFlow); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
  }
}

/**
 * This method waits for a document request, creates a credential descriptor
 * from which a visual representation and the {@link AcceptedFields} can be
 * generated, awaits for the user to select the fields to send and, ultimately,
 * send them
 */
function* handleProximityResponse() {
  yield* take(setProximityStatusReceivedDocument);
  const documentRequest = yield* select(selectProximityDocumentRequest);
  if (!documentRequest || !documentRequest.request) {
    throw new Error('Proximity error: no credential found');
  }
  const allCredentials = yield* select(selectCredentials);
  const mdocCredentials = allCredentials.filter(
    credential => credential.format === 'mso_mdoc'
  );
  const credentialDescriptor = yield* call(
    matchRequestToClaims,
    documentRequest,
    mdocCredentials
  );
  yield* put(setProximityStatusAuthorizationStarted(credentialDescriptor));

  const choice = yield* take([
    setProximityStatusAuthorizationSend,
    setProximityStatusAuthorizationRejected
  ]);

  if (setProximityStatusAuthorizationSend.match(choice)) {
    const documents: Array<Proximity.Document> = mdocCredentials.map(
      credential => ({
        alias: credential.keyTag,
        docType: credential.credentialType,
        issuerSignedContent: credential.credential
      })
    );

    const acceptedFields = yield* select(selectProximityAcceptedFields);
    if (acceptedFields) {
      yield* put(
        setIdentificationStarted({canResetPin: false, isValidatingTask: true})
      );
      const resAction = yield* take([
        setIdentificationIdentified,
        setIdentificationUnidentified
      ]);
      if (setIdentificationIdentified.match(resAction)) {
        const response = yield* call(
          Proximity.generateResponse,
          documents,
          acceptedFields
        );
        yield* call(Proximity.sendResponse, response);
        yield* put(setProximityStatusAuthorizationComplete());
        yield* call(closeFlow);
      } else {
        yield* call(closeFlow, true);
        yield* put(setProximityStatusStopped());
      }
    } else {
      yield* call(closeFlow, true);
    }
  } else {
    yield* call(closeFlow, true);
    yield* put(resetProximity());
  }
}

/**
 * This helper saga removes all listeners from the proximity handler and resets
 * the QR code
 * @param sendError whether to send an error response to the verifier or not
 */
function* closeFlow(sendError: boolean = false) {
  if (sendError) {
    yield* call(
      Proximity.sendErrorResponse,
      Proximity.ErrorCode.SESSION_TERMINATED
    );
  }
  yield* put(resetProximityQrCode());
  yield* call(() => {
    Proximity.removeListener('onDeviceConnected');
  });
  yield* call(() => {
    Proximity.removeListener('onDeviceConnecting');
  });
  yield* call(() => {
    Proximity.removeListener('onDeviceDisconnected');
  });
  yield* call(() => {
    Proximity.removeListener('onDocumentRequestReceived');
  });
  yield* call(() => {
    Proximity.removeListener('onError');
  });
  yield* call(Proximity.close);
}

type StoredCredentialWithIssuerSigned = StoredCredential & {
  issuerSigned: CBOR.IssuerSigned;
};

/**
 * This helper function takes a {@link VerifierRequest}, looks for
 * the presence of the required claims in the mDoc credentials and, if
 * found adds the {@link ParsedCredential} entry for the attribute to
 * an object following the same path structure of the original credential
 * @param verifierRequest The authentication request sent by the verifier
 * @param credentialsMdoc The mdoc credentials contained in the wallet
 * @returns An object that is a record of credential types to an object
 * which has the same structure of a decoded mDoc credential's namespaces
 * except for the fact that the namespace attribute keys are mapped to
 * the value corresponding to the same attribute key inside of the
 * {@link ParsedCredential} object.
 */
function* matchRequestToClaims(
  verifierRequest: VerifierRequest,
  credentialsMdoc: Array<StoredCredential>
) {
  const decodedCredentials: Array<StoredCredentialWithIssuerSigned> =
    yield* call(
      async () =>
        await Promise.all(
          credentialsMdoc.map(async credential => {
            const decodedIssuerSigned = await CBOR.decodeIssuerSigned(
              credential.credential
            );
            return {
              ...credential,
              issuerSigned: decodedIssuerSigned
            };
          })
        )
    );

  // Key: Credential type
  // Value : isAuthenticated + nameSpaces
  return Object.entries(verifierRequest.request).reduce(
    (prev, [key, value]) => {
      const credential = decodedCredentials.find(
        cred => cred.credentialType === key
      );
      if (credential) {
        // Key : namespace
        // Value : attributes
        const foundNamespaces = Object.entries(value)
          .filter(([key2, _]) => key2 !== 'isAuthenticated')
          .reduce((prev3, [namespace, attributes]) => {
            const foundNamespace = Object.entries(
              credential.issuerSigned.nameSpaces
            ).find(([ns]) => ns === namespace);
            if (foundNamespace) {
              const foundAttributes = Object.keys(attributes).reduce(
                attributesReducerGenerator(credential),
                {} as Record<string, ParsedCredential[string]>
              );
              if (Object.keys(foundAttributes).length !== 0) {
                return {
                  ...prev3,
                  [namespace]: foundAttributes
                };
              } else {
                return {
                  ...prev3
                };
              }
            }
            return {...prev3};
          }, {} as Record<string, Record<string, ParsedCredential[string]>>);
        if (Object.keys(foundNamespaces).length === 0) {
          return {...prev};
        } else {
          return {
            ...prev,
            [key]: foundNamespaces
          };
        }
      }
      return {
        ...prev
      };
    },
    {} as Record<
      string,
      Record<string, Record<string, ParsedCredential[string]>>
    >
  );
}

/**
 * Helper function to generate the attributes for the matchRequestToClaims method
 */
const attributesReducerGenerator =
  (credential: StoredCredentialWithIssuerSigned) =>
  (prev: Record<string, ParsedCredential[string]>, attribute: string) => {
    if (credential.parsedCredential[attribute]) {
      return {
        ...prev,
        [attribute]: credential.parsedCredential[attribute]
      };
    }
    return {...prev};
  };
