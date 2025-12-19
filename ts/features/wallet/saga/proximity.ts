import {
  AcceptedFields,
  parseVerifierRequest,
  Proximity
} from '@pagopa/io-react-native-proximity';
import {call, put, select, take} from 'typed-redux-saga';
import {ISO18013_5} from '@pagopa/io-react-native-iso18013';
import {serializeError} from 'serialize-error';
import {isAnyOf} from '@reduxjs/toolkit';
import {
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
import {
  getIsVerifierAuthenticated,
  matchRequestToClaims,
  verifierCertificates
} from '../utils/proximity';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../listener/listenerMiddleware';

const {
  ErrorCode,
  addListener,
  close,
  generateResponse,
  getQrCodeString,
  parseVerifierRequest,
  sendErrorResponse,
  sendResponse,
  start
} = ISO18013_5;

/**
 * Saga that handles the state of a proximity presentation
 */
const proximityPresentation: AppListenerWithAction<
  ReturnType<typeof setProximityStatusStarted>
> = async (_, listenerApi) => {
  try {
    // First thing, we request BLE permissions and we setup the proximity handler
    const permissions = await requestBlePermissions();
    if (!permissions) {
      throw new Error('Permissions not granted');
    }

    await close().catch(() => {});

    // Provide the verifiers certificates
    const certificates = verifierCertificates.map(cert => cert.certificate);

    await start({
      certificates: [certificates]
    });

    addListener('onDeviceConnecting', () => {});

    addListener('onDeviceConnected', () => {
      store.dispatch(setProximityStatusConnected());
    });

    addListener('onDocumentRequestReceived', payload => {
      // A new request has been received
      if (!payload || !payload.data) {
        store.dispatch(
          setProximityStatusError('Bad document request received')
        );
      }
    });

    Proximity.addListener('onDeviceConnected', () => {
      listenerApi.dispatch(setProximityStatusConnected());
    });

    addListener('onDeviceDisconnected', () => {
      store.dispatch(setProximityStatusStopped());
    });

    addListener('onError', payload => {
      store.dispatch(
        setProximityStatusError(payload?.error ?? 'Unknown internal error')
      );
    });

    // Parse and verify the received request with the exposed function
    const parsedJson = JSON.parse(payload.data);
    const parsedRequest = parseVerifierRequest(parsedJson);
    listenerApi.dispatch(setProximityStatusReceivedDocument(parsedRequest));

    Proximity.addListener('onDeviceDisconnected', () => {
      listenerApi.dispatch(setProximityStatusStopped());
    });

    Proximity.addListener('onError', payload => {
      listenerApi.dispatch(
        setProximityStatusError(payload?.error ?? 'Unknown internal error')
      );
    });

    // Set QR Code
    const qrCode = await getQrCodeString();
    listenerApi.dispatch(setProximityQrCode(qrCode));

    /**
     * Being that the device can be disconnected or the connection be lost
     * during the flow, we create this race condition that closes the flow
     * in case of error. Resetting the proximity state is up to the pages
     * that reset the navigation.
     * On top of that, the {@link handleProximityResponse} task will end either
     * receiving or sending a {@link setProximityStatusStopped}, so the race condition
     * handles both the synchronous end of the flow, too.
     */
    await Promise.race([
      handleProximityResponse(),
      (async () => {
        const action = await listenerApi.take(
          isAnyOf(setProximityStatusStopped, setProximityStatusError)
        );

        if (setProximityStatusError.match(action)) {
          await sendErrorResponse(ErrorCode.SESSION_TERMINATED);
        }

        closeFlow();
      })()
    ]);
  } catch (e) {
    listenerApi.dispatch(setProximityStatusError(`${serializeError(e)}`));
    listenerApi.dispatch(closeFlow); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
  }
};

/**
 * Helper function to send the Proximity Response in case of successful wallet owner identification
 * @param documents An array of Proximity Documents
 * @param acceptedFields The Proximity Presentation's {@link AcceptedFields}
 */
function* onProximitySendResponseIdentified(
  documents: Array<ISO18013_5.RequestedDocument>,
  acceptedFields: ISO18013_5.AcceptedFields
) {
  const response = yield* call(generateResponse, documents, acceptedFields);
  yield* call(sendResponse, response);
  yield* put(setProximityStatusAuthorizationComplete());
  // This is needed so that the saga racing with this can trigger
  yield* take(setProximityStatusStopped);
}

/**
 * Helper function to handle the case in which the wallet owner is not identified during a Proximity Presentation
 */
function* onProximitySendResponseUnidentified() {
  yield* call(abortProximityFlow);
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
  const descriptor = yield* call(
    matchRequestToClaims,
    documentRequest,
    mdocCredentials
  );

  const isAuthenticated = getIsVerifierAuthenticated(documentRequest);
  yield* put(
    setProximityStatusAuthorizationStarted({
      descriptor,
      isAuthenticated
    })
  );

  const choice = yield* take([
    setProximityStatusAuthorizationSend,
    setProximityStatusAuthorizationRejected
  ]);

  if (setProximityStatusAuthorizationSend.match(choice)) {
    const documents: Array<ISO18013_5.RequestedDocument> = mdocCredentials.map(
      credential => ({
        issuerSignedContent: credential.credential,
        alias: credential.keyTag,
        docType: credential.credentialType
      })
    );

    const acceptedFields = yield* select(selectProximityAcceptedFields);

    if (acceptedFields) {
      const onIdentificationIdentified: IdentificationResultTask<
        typeof onProximitySendResponseIdentified
      > = {
        fn: onProximitySendResponseIdentified,
        args: [documents, acceptedFields]
      };

      const onIdentificationUnidentified: IdentificationResultTask<
        typeof onProximitySendResponseUnidentified
      > = {
        fn: onProximitySendResponseUnidentified,
        args: []
      };

      yield* call(
        startSequentializedIdentificationProcess,
        {
          canResetPin: false,
          isValidatingTask: true
        },
        onIdentificationIdentified,
        onIdentificationUnidentified
      );
    } else {
      yield* call(abortProximityFlow);
    }
  } else {
    yield* call(abortProximityFlow);
  }
}

/**
 * Utility function for proximity flows bad termination
 */
function* abortProximityFlow() {
  yield* call(sendErrorResponse, ErrorCode.SESSION_TERMINATED);
  // After sending the error message, this action is triggered to close the flow in the race condition
  yield* put(setProximityStatusStopped());
}

/**
 * This helper saga removes all listeners from the proximity handler and resets
 * the QR code
 */

// #WLEO-741 Refactor Event Listener Handling into a Custom Hook

function* closeFlow() {
  yield* put(resetProximityQrCode());
  yield* call(close);
}

export const addProximityListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: setProximityStatusStarted,
    effect: async (action, listenerApi) => {
      // This works as a takeLatest
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(15);
      await proximityPresentation(action, listenerApi);
    }
  });
};
