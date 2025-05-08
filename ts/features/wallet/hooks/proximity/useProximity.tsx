import {Proximity, parseVerifierRequest} from '@pagopa/io-react-native-proximity';
import {serializeError} from 'serialize-error';
import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {addProximityLog} from '../../store/proximity';
import {requestBlePermissions} from '../../utils/permissions';
import {
  generateAcceptedFields,
  isRequestMdl,
} from '../../utils/proximity';
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
    (
      data: Proximity.QrEngagementEventPayloads['onDeviceRetrievalHelperReady']
    ) => {
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
    (
      data: Proximity.QrEngagementEventPayloads['onCommunicationError']
    ) => {
      dispatch(
        addProximityLog(
          `[ON_COMMUNICATION_ERROR_CALLBACK] ${JSON.stringify(data)}`
        )
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
    async (
      onNewData: Proximity.QrEngagementEventPayloads['onNewDeviceRequest']
    ) => {
      try {
        if (!onNewData || !onNewData.message) {
          throw new Error('Invalid onNewDeviceRequest payload');
        }
        const message = onNewData.message;

        const parsedJson = JSON.parse(message);

        // Validate using Zod with parse
        const parsedResponse = parseVerifierRequest(parsedJson);

        /*
        Currently only supporting mDL requests thus we check if the requests consists of a single credential       
        and if the credential is of type mDL.
        */
        isRequestMdl(Object.keys(parsedResponse.request));

        if (!mdl) {
          throw new Error('No mDL credential found');
        }

        const documents: Array<Proximity.Document> = [
          {
            alias: mdl.keyTag,
            docType: mdl.credentialType,
            issuerSignedContent: mdl.credential
          }
        ];

        const acceptedFields = generateAcceptedFields(parsedResponse.request);

        // Generate the response payload
        const result = await Proximity.generateResponse(
          documents,
          acceptedFields
        );

        await Proximity.sendResponse(result);
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
      await Proximity.initializeQrEngagement(true, false, true); // Peripheral mode
      const qrCode = await Proximity.getQrCodeString();
      // Register listeners
      Proximity.addListener('onDeviceRetrievalHelperReady', data =>
        onDeviceRetrievalHelperReady(data)
      );
      Proximity.addListener('onCommunicationError', onErrorData =>
        onCommunicationError(onErrorData)
      );
      Proximity.addListener('onNewDeviceRequest', onNewData =>
        onNewDeviceRequest(onNewData)
      );
      return qrCode;
    } catch (e) {
      dispatch(addProximityLog(`initProximity error: ${serializeError(e)}`));
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
    Proximity.removeListeners('onDeviceRetrievalHelperReady');
    Proximity.removeListeners('onCommunicationError');
    Proximity.removeListeners('onNewDeviceRequest');
    Proximity.closeQrEngagement().catch(() => {}); // Ignore the error
  };

  return {initProximity, closeConnection};
};
