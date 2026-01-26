import { ISO18013_5 } from '@pagopa/io-react-native-iso18013';
import { serializeError } from 'serialize-error';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
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
import { requestBlePermissions } from '../utils/permissions';
import { store } from '../../../store';
import { selectCredentials } from '../store/credentials';
import {
  getIsVerifierAuthenticated,
  matchRequestToClaims,
  verifierCertificates
} from '../utils/proximity';
import {
  AppListener,
  AppListenerWithAction,
  AppStartListening
} from '../../../middleware/listener';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import { takeLatestEffect } from '../../../middleware/listener/effects';

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
 * Listener that handles the state of a proximity presentation
 */
const proximityListener: AppListenerWithAction<
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
        return;
      }

      // Parse and verify the received request with the exposed function
      const parsedJson = JSON.parse(payload.data);
      const parsedRequest = parseVerifierRequest(parsedJson);
      store.dispatch(setProximityStatusReceivedDocument(parsedRequest));
    });

    addListener('onDeviceDisconnected', () => {
      store.dispatch(setProximityStatusStopped());
    });

    addListener('onError', payload => {
      store.dispatch(
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
      // task branch
      responseHandler(listenerApi),

      // cancel branch
      cancelHandler(listenerApi)
    ]);
  } catch (error) {
    // Ignore if the task was aborted
    if (error instanceof TaskAbortError) {
      return;
    }
    listenerApi.dispatch(setProximityStatusError(`${serializeError(error)}`));
    await closeFlow(listenerApi); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
  }
};

const cancelHandler = async (listenerApi: AppListener) => {
  const resAction = await listenerApi.take(
    isAnyOf(setProximityStatusStopped, setProximityStatusError)
  );

  if (setProximityStatusError.match(resAction[0])) {
    await sendErrorResponse(ErrorCode.SESSION_TERMINATED);
  }

  await closeFlow(listenerApi);
};

const responseHandler = async (listenerApi: AppListener) => {
  await listenerApi.take(isAnyOf(setProximityStatusReceivedDocument));
  const documentRequest = selectProximityDocumentRequest(
    listenerApi.getState()
  );
  if (!documentRequest || !documentRequest.request) {
    throw new Error('Proximity error: no credential found');
  }
  const allCredentials = selectCredentials(listenerApi.getState());
  const mdocCredentials = allCredentials.filter(
    credential => credential.format === 'mso_mdoc'
  );
  const descriptor = await matchRequestToClaims(
    documentRequest,
    mdocCredentials
  );

  const isAuthenticated = getIsVerifierAuthenticated(documentRequest);
  listenerApi.dispatch(
    setProximityStatusAuthorizationStarted({
      descriptor,
      isAuthenticated
    })
  );

  const choice = await listenerApi.take(
    isAnyOf(
      setProximityStatusAuthorizationSend,
      setProximityStatusAuthorizationRejected
    )
  );

  if (setProximityStatusAuthorizationSend.match(choice[0])) {
    const documents: Array<ISO18013_5.RequestedDocument> = mdocCredentials.map(
      credential => ({
        issuerSignedContent: credential.credential,
        alias: credential.keyTag,
        docType: credential.credentialType
      })
    );

    const acceptedFields = selectProximityAcceptedFields(
      listenerApi.getState()
    );

    if (acceptedFields) {
      listenerApi.dispatch(
        setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
      );
      const resAction = await listenerApi.take(
        isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
      );
      if (setIdentificationIdentified.match(resAction[0])) {
        const response = await generateResponse(documents, acceptedFields);
        await sendResponse(response);
        listenerApi.dispatch(setProximityStatusAuthorizationComplete());
        // This is needed so that the listener racing with this can trigger
        await listenerApi.take(isAnyOf(setProximityStatusStopped));
      } else {
        await abortProximityFlow(listenerApi);
      }
    } else {
      await abortProximityFlow(listenerApi);
    }
  } else {
    await abortProximityFlow(listenerApi);
  }
};

/**
 * Utility function for proximity flows bad termination
 */
const abortProximityFlow = async (listenerApi: AppListener) => {
  await sendErrorResponse(ErrorCode.SESSION_TERMINATED);
  // After sending the error message, this action is triggered to close the flow in the race condition
  listenerApi.dispatch(setProximityStatusStopped());
};

/**
 * This helper function removes all listeners from the proximity handler and resets
 * the QR code
 */

// #WLEO-741 Refactor Event Listener Handling into a Custom Hook

const closeFlow = async (listenerApi: AppListener) => {
  listenerApi.dispatch(resetProximityQrCode());
  await close();
};

export const addProximityListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: setProximityStatusStarted,
    effect: takeLatestEffect(proximityListener)
  });
};
