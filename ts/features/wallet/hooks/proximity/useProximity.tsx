import ProximityModule, {
  QrEngagementEventPayloads
} from '@pagopa/io-react-native-proximity';
import {serializeError} from 'serialize-error';
import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {setProximityError, addProximityLog} from '../../store/proximity';
import {requestBlePermissions} from '../../utils/permissions';
import {VerifierRequest} from '../../utils/proximity';
import {wellKnownCredential} from '../../utils/credentials';
import {selectCredential} from '../../store/credentials';
import {sleep} from '../../../../utils/time';

export const useProximity = () => {
  const dispatch = useAppDispatch();
  const mdl = useAppSelector(
    selectCredential(wellKnownCredential.DRIVING_LICENSE)
  );

  /**
   * Callback for when the device retrieval helper is ready.
   * Currently we just set the qrcode in the store so that it can be displayed.
   * @param qrCode - The QR code string to be displayed.
   */
  const onDeviceRetrievalHelperReady = useCallback(
    (data: QrEngagementEventPayloads['onDeviceRetrievalHelperReady']) => {
      dispatch(
        addProximityLog(`onDeviceRetrievalHelperReady ${JSON.stringify(data)}`)
      );
    },
    [dispatch]
  );

  /**
   * Callback for when an error occurs during communication.
   * It sets the error in the store and closes the connection.
   * @param onErrorData - The error data.
   */
  const onCommunicationError = useCallback(
    (data: QrEngagementEventPayloads['onCommunicationError']) => {
      dispatch(addProximityLog(`An error occurred check the debug menu`));
      dispatch(
        setProximityError({
          error: `[ON_COMMUNICATION_ERROR_CALLBACK] ${JSON.stringify(data)}`
        })
      );
    },
    [dispatch]
  );

  /**
   * Callback for when a new device request is received.
   * It parses the request, validates it and sends a response.
   * If an error occurs it sets the error in the store and closes the connection.
   * This should happen in two steps as the user must approve the request before sending the response.
   * However, we are sending the response immediately for simplicity.
   * @param onNewData - The device request
   */
  const onNewDeviceRequest = useCallback(
    async (onNewData: QrEngagementEventPayloads['onNewDeviceRequest']) => {
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
          await ProximityModule.sendErrorResponseNoData();
          throw new Error(
            `Unexpected request keys. Expected only one key but got: ${requestKeys}`
          );
        }
        if (requestKeys[0] !== wellKnownCredential.DRIVING_LICENSE) {
          await ProximityModule.sendErrorResponseNoData();
          throw new Error(
            `More than MDL request found. Only MDL request is supported. Found: ${requestKeys}`
          );
        }

        if (!mdl) {
          throw new Error('MDL not found');
        }

        // Generate the response payload
        const responsePayload = JSON.stringify(parsedResponse.request);

        // Generate the response
        await ProximityModule.generateResponse(
          mdl.credential,
          responsePayload,
          mdl.keyTag
        );
        // Wait for the response to be sent before closing everything, we don't know when it's done
        await sleep(5000);
        dispatch(
          addProximityLog('Response sent, 5s delay passed, closing connection')
        );
      } catch (e) {
        const serErr = serializeError(e);
        dispatch(
          addProximityLog(
            `An error occurred while processing the request: ${serErr}`
          )
        );
      } finally {
        await closeConnection();
      }
    },
    [dispatch, mdl]
  );

  /**
   * Function which initializes the QR engagement, generates the QR code and listens for incoming events
   * by registering the appropriate callbacks.
   */
  const initProximity = useCallback(async () => {
    try {
      const permissions = await requestBlePermissions();
      if (!permissions) {
        throw new Error('Permissions not granted');
      }
      await ProximityModule.initializeQrEngagement(true, false, true); // Peripheral mode
      const qrCode = await ProximityModule.getQrCodeString();
      // Register listeners
      ProximityModule.addListener('onDeviceRetrievalHelperReady', data =>
        onDeviceRetrievalHelperReady(data)
      );
      ProximityModule.addListener('onCommunicationError', onErrorData =>
        onCommunicationError(onErrorData)
      );
      ProximityModule.addListener('onNewDeviceRequest', onNewData =>
        onNewDeviceRequest(onNewData)
      );
      return qrCode;
    } catch (e) {
      dispatch(addProximityLog(`An error occurred check the debug menu`));
      dispatch(setProximityError({error: serializeError(e)}));
      await closeConnection();
      throw new Error('Error initializing proximity, connection closed');
    }
  }, [
    dispatch,
    onCommunicationError,
    onDeviceRetrievalHelperReady,
    onNewDeviceRequest
  ]);

  /**
   * Closes the connection and removes the listeners.
   * This is called when the connection is closed or when an error occurs.
   */
  const closeConnection = async () => {
    ProximityModule.removeListeners('onDeviceRetrievalHelperReady');
    ProximityModule.removeListeners('onCommunicationError');
    ProximityModule.removeListeners('onNewDeviceRequest');
    ProximityModule.closeQrEngagement().catch(() => {}); // Ignore the error
  };

  return {initProximity, closeConnection};
};
