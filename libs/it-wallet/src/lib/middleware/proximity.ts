import { ISO18013_5 } from '@pagopa/io-react-native-iso18013';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import { t } from 'i18next';
import {
  AppState,
  EmitterSubscription,
  NativeEventSubscription
} from 'react-native';
import { selectCredentials } from '../store/credentials';
import {
  ProximityStatus,
  resetProximityQrCode,
  selectProximityDocumentRequest,
  selectProximityEngagementMode,
  selectProximityGrantedConsentKey,
  selectProximityIsConnected,
  selectProximityRetrievalMethod,
  selectProximityStatus,
  setProximityGrantedConsent,
  setProximityIsConnected,
  setProximityQrCode,
  setProximityRetrievalMethod,
  setProximityStatusAuthorizationComplete,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationSend,
  setProximityStatusAuthorizationStarted,
  setProximityStatusConnected,
  setProximityStatusError,
  setProximityStatusPresentationDetails,
  setProximityStatusReceivedDocument,
  setProximityStatusStarted,
  setProximityStatusStopped,
  setProximityStoreConsentChosen,
  setProximityStoreConsentPrompt
} from '../store/proximity';
import {
  generateConsentKey,
  getConsentDataFromProximityDetails,
  itwGrantProximityConsent,
  selectProximityConsentExists
} from '../store/proximityConsents';
import { CredentialFormat } from '../utils/itwTypesUtils';
import { CredentialsVault } from '../utils/itwCredentialVault';
import { requestBlePermissions } from '../utils/permissions';
import {
  generateAcceptedFields,
  getIsVerifierAuthenticated,
  getProximityDetails,
  verifierCertificates
} from '../utils/proximity';
import { takeLatestEffect } from '@io-eudiw-app/commons';
import { AppListener, AppListenerWithAction, AppStartListening } from './types';
import { serializeErrorOrUnknown } from '../utils/errors';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import { WalletCombinedRootState } from '../store';

const {
  ErrorCode,
  addListener,
  close,
  generateResponse,
  parseVerifierRequest,
  sendErrorResponse,
  sendResponse,
  setHceModalMessage,
  startEngagement
} = ISO18013_5;

/**
 * Native engagement configuration per engagement mode, mirroring the IO-App
 * `ENGAGEMENT_CONFIG`. QR engagement retrieves the documents over BLE, while NFC
 * engagement allows both BLE (preferred) and NFC retrieval.
 */
const ENGAGEMENT_CONFIG: Record<
  ISO18013_5.EngagementMode,
  {
    engagementModes: ReadonlyArray<ISO18013_5.EngagementMode>;
    retrievalMethods: ReadonlyArray<ISO18013_5.RetrievalMethod>;
  }
> = {
  qrcode: { engagementModes: ['qrcode'], retrievalMethods: ['ble'] },
  nfc: { engagementModes: ['nfc'], retrievalMethods: ['ble', 'nfc'] }
};

const startProximityEngagement = async (appState: WalletCombinedRootState) => {
  // Provide the verifiers certificates
  const certificates = verifierCertificates.map(cert => cert.certificate);
  const engagementMode = selectProximityEngagementMode(appState);
  const { engagementModes, retrievalMethods } =
    ENGAGEMENT_CONFIG[engagementMode];
  await startEngagement({
    certificates: [certificates],
    engagementModes,
    retrievalMethods
  });
};

const removeProximityListeners = (listeners: Array<EmitterSubscription>) => {
  listeners.forEach(listener => listener.remove());
};

const addLifecycleListeners = (listenerApi: AppListener) => {
  return AppState.addEventListener('change', async state => {
    const appState = listenerApi.getState();
    if (!selectProximityIsConnected(appState)) {
      if (state === 'active') {
        await startProximityEngagement(appState);
      } else if (state === 'background') {
        await close();
      }
    }
  });
};

const removeLifecycleListeners = (subscr: NativeEventSubscription) =>
  subscr.remove();

/**
 * True while an NFC-retrieval flow is intentionally tearing the session down to
 * let the user review the request (from teardown until the engagement restart).
 * During this window the native session is closed on purpose, so the
 * disconnect/stop/error events it emits must be ignored instead of aborting the
 * flow. Mirrors io-app's `and([or([TerminatingForConsent, ClaimsDisclosure]),
 * isNfcRetrieval])` guards.
 */
const isInNfcConsentWindow = (state: ReturnType<AppListener['getState']>) => {
  if (selectProximityRetrievalMethod(state) !== 'nfc') {
    return false;
  }
  const status = selectProximityStatus(state);
  return (
    status === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED ||
    status === ProximityStatus.PROXIMITY_STATUS_STORE_CONSENT ||
    status === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND
  );
};

/**
 * Listener that handles the state of a proximity presentation
 */
const proximityListener: AppListenerWithAction<
  ReturnType<typeof setProximityStatusStarted>
> = async (_, listenerApi) => {
  // The engagement mode is read from the store: switching it to 'nfc' and
  // re-dispatching `setProximityStatusStarted` restarts this listener (via
  // `takeLatestEffect`) with the NFC native configuration.
  const engagementMode = selectProximityEngagementMode(listenerApi.getState());

  const listeners = [
    addListener('onQrCodeString', qrCode => {
      listenerApi.dispatch(setProximityQrCode(qrCode.data));
    }),
    addListener('onNfcStarted', () => null),
    addListener('onNfcStopped', () => {
      // Ignore the stop we caused ourselves while tearing the session down for
      // the NFC-retrieval consent review.
      if (isInNfcConsentWindow(listenerApi.getState())) {
        return;
      }
      // The NFC/HCE session has ended (e.g. the user dismissed the system
      // modal). Treat it as a stop so the cancel branch closes the flow.
      listenerApi.dispatch(setProximityStatusStopped());
    }),
    addListener('onDeviceConnecting', () => null),
    addListener('onDeviceConnected', () => {
      listenerApi.dispatch(setProximityStatusConnected());
      listenerApi.dispatch(setProximityIsConnected(true));
    }),
    addListener('onDocumentRequestReceived', payload => {
      // A new request has been received
      if (!payload || !payload.data) {
        listenerApi.dispatch(
          setProximityStatusError('Bad document request received')
        );
        return;
      }

      // Parse and verify the received request with the exposed function
      const parsedJson = JSON.parse(payload.data);
      const parsedRequest = parseVerifierRequest(parsedJson);
      // Track the retrieval method negotiated by the verifier (ble | nfc)
      listenerApi.dispatch(
        setProximityRetrievalMethod(payload.retrievalMethod)
      );
      listenerApi.dispatch(setProximityStatusReceivedDocument(parsedRequest));
    }),
    addListener('onDeviceDisconnected', () => {
      // Expected disconnect while the NFC-retrieval session is intentionally
      // torn down for consent review; ignore it.
      listenerApi.dispatch(setProximityIsConnected(false));
      if (isInNfcConsentWindow(listenerApi.getState())) {
        return;
      }
      listenerApi.dispatch(setProximityStatusStopped());
    }),
    addListener('onError', payload => {
      // Expected error while the NFC-retrieval session is intentionally torn
      // down for consent review; ignore it.
      if (isInNfcConsentWindow(listenerApi.getState())) {
        return;
      }
      listenerApi.dispatch(
        setProximityStatusError(payload?.error ?? 'Unknown internal error')
      );
    })
  ];

  const retHandle = addLifecycleListeners(listenerApi);

  try {
    // First thing, we request BLE permissions and we setup the proximity handler
    const permissions = await requestBlePermissions();
    if (!permissions) {
      throw new Error('Permissions not granted');
    }

    await close().catch(() => null);

    if (engagementMode === 'nfc') {
      // iOS-only: copy displayed in the NFC HCE system modal during engagement
      setHceModalMessage(
        t('proximity.nfcEngagement.ready.ios', { ns: 'wallet' })
      );
    }

    await startProximityEngagement(listenerApi.getState());

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
    listenerApi.dispatch(
      setProximityStatusError(JSON.stringify(serializeErrorOrUnknown(error)))
    );
    await closeFlow(listenerApi); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
  } finally {
    removeLifecycleListeners(retHandle);
    removeProximityListeners(listeners);
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

/**
 * Runs the user identification (biometric/PIN) step and resolves to `true` when
 * the user is successfully identified.
 */
const runIdentification = async (
  listenerApi: AppListener
): Promise<boolean> => {
  listenerApi.dispatch(
    setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
  );
  const resAction = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  return setIdentificationIdentified.match(resAction[0]);
};

/**
 * Builds the response documents from the presentable mDOC credentials and sends
 * them to the verifier, then waits for the flow to be stopped so the listener
 * racing with this task can complete.
 */
const transmit = async (
  listenerApi: AppListener,
  documentRequest: ISO18013_5.VerifierRequest,
  mdocCredentials: ReturnType<typeof selectCredentials>
) => {
  const acceptedFields = generateAcceptedFields(documentRequest.request);
  if (!acceptedFields) {
    await abortProximityFlow(listenerApi);
    return;
  }

  const documents: Array<ISO18013_5.RequestedDocument> = await Promise.all(
    mdocCredentials.map(async credential => {
      const encoded = await CredentialsVault.get(credential.credentialType);
      if (!encoded) {
        throw new Error(
          `Encoded credential missing in vault for ${credential.credentialType}`
        );
      }
      return {
        issuerSignedContent: encoded,
        alias: credential.keyTag,
        docType: credential.credentialType
      };
    })
  );

  const response = await generateResponse(documents, acceptedFields);
  await sendResponse(response);
  listenerApi.dispatch(setProximityStatusAuthorizationComplete());
  // This is needed so that the listener racing with this can trigger
  await listenerApi.take(isAnyOf(setProximityStatusStopped));
};

/**
 * Tears down the live native session without leaving the proximity flow. Used by
 * the NFC-retrieval dance to release the NFC link before the user reviews the
 * request: the session cannot be held open while the claims screen is shown.
 */
const terminateSessionForConsent = async () => {
  await sendErrorResponse(ErrorCode.SESSION_TERMINATED).catch(() => null);
  await close().catch(() => null);
};

const responseHandler = async (listenerApi: AppListener) => {
  await listenerApi.take(isAnyOf(setProximityStatusReceivedDocument));
  const retrievalMethod = selectProximityRetrievalMethod(
    listenerApi.getState()
  );
  if (retrievalMethod === 'ble') {
    await listenerApi.take(isAnyOf(setProximityStatusPresentationDetails));
  }
  const documentRequest = selectProximityDocumentRequest(
    listenerApi.getState()
  );
  if (!documentRequest || !documentRequest.request) {
    throw new Error('Proximity error: no credential found');
  }
  const allCredentials = selectCredentials(listenerApi.getState());
  const mdocCredentials = allCredentials.filter(
    credential => credential.format === CredentialFormat.MDOC
  );

  const descriptor = getProximityDetails(
    documentRequest.request,
    mdocCredentials
  );
  if (!descriptor) {
    await abortProximityFlow(listenerApi);
    return;
  }

  const isAuthenticated = getIsVerifierAuthenticated(documentRequest);

  const consentData = getConsentDataFromProximityDetails(descriptor);
  const consentKey = generateConsentKey(consentData);
  const hasConsent =
    selectProximityGrantedConsentKey(listenerApi.getState()) === consentKey ||
    selectProximityConsentExists(consentData)(listenerApi.getState());

  // NFC retrieval, consent already granted (and identified) earlier this
  // session: the verifier re-issued the request after the re-engagement, so
  // transmit straight away, skipping the claims and identification steps.
  if (retrievalMethod === 'nfc' && hasConsent) {
    await transmit(listenerApi, documentRequest, mdocCredentials);
    return;
  }

  // NFC retrieval, no consent yet: the NFC link cannot be held open while the
  // user reviews the request, so surface the claims (setting the swallow-window
  // status first), then tear the session down, gather consent + identification,
  // and re-engage so the verifier re-issues the request.
  if (retrievalMethod === 'nfc') {
    listenerApi.dispatch(
      setProximityStatusAuthorizationStarted({ descriptor, isAuthenticated })
    );
    await terminateSessionForConsent();

    const choice = await listenerApi.take(
      isAnyOf(
        setProximityStatusAuthorizationSend,
        setProximityStatusAuthorizationRejected
      )
    );
    if (!setProximityStatusAuthorizationSend.match(choice[0])) {
      await abortProximityFlow(listenerApi);
      return;
    }

    listenerApi.dispatch(setProximityStoreConsentPrompt());
    const storeChoice = await listenerApi.take(
      isAnyOf(setProximityStoreConsentChosen)
    );

    if (!(await runIdentification(listenerApi))) {
      await abortProximityFlow(listenerApi);
      return;
    }

    if (storeChoice[0].payload.store) {
      listenerApi.dispatch(itwGrantProximityConsent(consentData));
    }
    // Session-scoped consent survives the engagement restart below.
    listenerApi.dispatch(setProximityGrantedConsent(consentKey));
    // Re-engage: restarts this listener (via takeLatestEffect) with the NFC
    // configuration so the verifier can re-issue the request and we transmit.
    listenerApi.dispatch(setProximityStatusStarted());
    return;
  }

  // BLE retrieval (QR engagement, or NFC engagement negotiating BLE): the
  // connection stays open through the claims review, so use the standard
  // single-session claims -> identify -> send flow.
  listenerApi.dispatch(
    setProximityStatusAuthorizationStarted({ descriptor, isAuthenticated })
  );

  const choice = await listenerApi.take(
    isAnyOf(
      setProximityStatusAuthorizationSend,
      setProximityStatusAuthorizationRejected
    )
  );
  if (!setProximityStatusAuthorizationSend.match(choice[0])) {
    await abortProximityFlow(listenerApi);
    return;
  }

  if (!(await runIdentification(listenerApi))) {
    await abortProximityFlow(listenerApi);
    return;
  }

  await transmit(listenerApi, documentRequest, mdocCredentials);
};

/**
 * Utility function for proximity flows bad termination
 */
const abortProximityFlow = async (listenerApi: AppListener) => {
  // Best-effort: the session may already be torn down (NFC consent window).
  await sendErrorResponse(ErrorCode.SESSION_TERMINATED).catch(() => null);
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
