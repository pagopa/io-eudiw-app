import {call, delay, put, race, select, takeLatest} from 'typed-redux-saga';

import {serializeError} from 'serialize-error';
import ProximityModule, {
  QrEngagementEventPayloads
} from '@pagopa/io-react-native-proximity';
import {VerifierRequest} from '../utils/proximity';
import {wellKnownCredential} from '../utils/credentials';
import {selectCredential} from '../store/credentials';
import {
  resetProximity,
  setProximityError,
  setProximityQrCode,
  setProximityState,
  startProximity
} from '../store/proximity';
import {requestBlePermissions} from '../utils/permissions';


/**
 * Callback for when a new device request is received.
 * It parses the request, validates it and sends a response.
 * If an error occurs it sets the error in the store and closes the connection.
 * This should happen in two steps as the user must approve the request before sending the response.
 * However, we are sending the response immediately for simplicity.
 * @param onNewData - The device request
 */
function* onNewDeviceRequestCallback(
  onNewData: QrEngagementEventPayloads['onNewDeviceRequest']
) {
  console.log('oook');
  try {
    if (!onNewData || !onNewData.message) {
      throw new Error('Invalid onNewDeviceRequest payload');
    }
    const message = onNewData.message;

    const parsedJson = JSON.parse(message);

    // Validate using Zod with parse
    const parsedResponse = VerifierRequest.parse(parsedJson);

    // Ensure that the request object has exactly one key and it matches the expected key
    const requestKeys = Object.keys(parsedResponse.request);

    if (requestKeys.length !== 1) {
      yield* call(ProximityModule.sendErrorResponseNoData);
      throw new Error(
        `Unexpected request keys. Expected only one key but got: ${requestKeys}`
      );
    }
    if (requestKeys[0] !== wellKnownCredential.DRIVING_LICENSE) {
      yield* call(ProximityModule.sendErrorResponseNoData);
      throw new Error(
        `More than MDL request found. Only MDL request is supported. Found: ${requestKeys}`
      );
    }

    // Get MDL (why is this duplicated?)
    const mdl = yield* select(
      selectCredential(wellKnownCredential.DRIVING_LICENSE)
    );

    if (!mdl) {
      throw new Error('MDL not found');
    }

    // Generate the response payload
    const responsePayload = JSON.stringify(parsedResponse.request);

    // Generate the response
    yield* (ProximityModule.generateResponse,
    mdl.credential,
    responsePayload,
    mdl.keyTag);
    // Wait for the response to be sent before closing everything, we don't know when it's done
    yield* delay(5000);
    yield* put(
      setProximityState('Response sent, 5s delay passed, closing connection')
    );
  } catch (e) {
    yield* put(setProximityError({error: serializeError(e)}));
  } finally {
    yield* closeConnection();
  }
}

/**
 * Closes the connection and removes the listeners.
 * This is called when the connection is closed or when an error occurs.
 */
function* closeConnection() {
  ProximityModule.removeListeners('onDeviceRetrievalHelperReady');
  ProximityModule.removeListeners('onCommunicationError');
  ProximityModule.removeListeners('onNewDeviceRequest');
  yield* call(ProximityModule.closeQrEngagement);
}
