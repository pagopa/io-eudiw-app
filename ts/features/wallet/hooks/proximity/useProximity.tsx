import {
  Proximity,
  parseVerifierRequest
} from '@pagopa/io-react-native-proximity';
import {serializeError} from 'serialize-error';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert} from 'react-native';
import {useAppSelector} from '../../../../store';
import {requestBlePermissions} from '../../utils/permissions';
import {
  getTypeRequest,
  generateAcceptedFields,
  getDocumentsByRequestType
} from '../../utils/proximity';
import {selectCredentials} from '../../store/credentials';
import {useLogBox} from './useLogBox';

export const useProximity = () => {
  const credentials = useAppSelector(selectCredentials);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const {logBox, setLogBox, resetLogBox} = useLogBox();
  const {t} = useTranslation(['wallet']);

  /**
   * Close utility function to close the proximity flow.
   */
  const closeFlow = useCallback(async (sendError: boolean = false) => {
    if (sendError) {
      await Proximity.sendErrorResponse(Proximity.ErrorCode.SESSION_TERMINATED);
    }
    setQrCode(null);
    Proximity.removeListener('onDeviceConnected');
    Proximity.removeListener('onDeviceConnecting');
    Proximity.removeListener('onDeviceDisconnected');
    Proximity.removeListener('onDocumentRequestReceived');
    Proximity.removeListener('onError');
    await Proximity.close();
  }, []);

  /**
   * Callback function to handle device connection.
   * Currently does nothing but can be used to update the UI
   */
  const handleOnDeviceConnected = useCallback(() => {
    setLogBox('[ON_DEVICE_CONNECTED_CALLBACK]');
  }, [setLogBox]);

  /**
   * Callback function to handle device connection.
   * Currently does nothing but can be used to update the UI
   */
  const handleOnDeviceConnecting = useCallback(() => {
    setLogBox('[ON_DEVICE_CONNECTING_CALLBACK]');
  }, [setLogBox]);

  /**
   * Callback function to handle device disconnection.
   */
  const onDeviceDisconnected = useCallback(async () => {
    try {
      setLogBox('[ON_DEVICE_DISCONNECTED_CALLBACK] Check the verifier app');
      await closeFlow();
      Alert.alert(
        t('wallet:proximity.disconnected.title'),
        t('wallet:proximity.disconnected.body')
      );
    } catch (e) {
      setLogBox(
        `[ON_DEVICE_DISCONNECTED_CALLBACK] error: ${serializeError(e)}`
      );
    }
  }, [closeFlow, setLogBox, t]);

  const onError = useCallback(
    async (data: Proximity.EventsPayload['onError']) => {
      try {
        setLogBox(`[ON_ERROR_CALLBACK] {${serializeError(data)}}\n`);
        await closeFlow();
      } catch (e) {
        setLogBox(`[ON_ERROR_CALLBACK] error: ${serializeError(e)}\n`);
      }
    },
    [closeFlow, setLogBox]
  );

  /**
   * Callback function to handle a new request received from the verifier app.
   * @param request The request object
   * @returns The response object
   * @throws Error if the request is invalid
   * @throws Error if the response generation fails
   */
  const onDocumentRequestReceived = useCallback(
    async (payload: Proximity.EventsPayload['onDocumentRequestReceived']) => {
      try {
        // A new request has been received
        if (!payload || !payload.data) {
          throw new Error('Invalid onNewDeviceRequest payload');
        }

        // Parse and verify the received request with the exposed function
        const parsedJson = JSON.parse(payload.data);

        const parsedRequest = parseVerifierRequest(parsedJson);
        const type = getTypeRequest(Object.keys(parsedRequest.request));
        const documents = getDocumentsByRequestType(type, credentials);

        if (!documents) {
          // We can't find the mDL thus we send an error response to the verifier app
          await Proximity.sendErrorResponse(Proximity.ErrorCode.CBOR_DECODING);
        } else {
          const proximityDocuments: Array<Proximity.Document> = documents.map(
            doc => ({
              issuerSignedContent: doc.credential,
              alias: doc.keyTag,
              docType: doc.credentialType
            })
          );

          /*
           * Generate the response to be sent to the verifier app. Currently we blindly accept all the fields requested by the verifier app.
           * In an actual implementation, the user would be prompted to accept or reject the requested fields and the `acceptedFields` object
           * must be generated according to the user's choice, setting the value to true for the accepted fields and false for the rejected ones.
           * See the `generateResponse` method for more details.
           */

          const acceptedFields = generateAcceptedFields(parsedRequest.request);
          const result = await Proximity.generateResponse(
            proximityDocuments,
            acceptedFields
          );

          /**
           * Send the response to the verifier app.
           * Currently we don't know what the verifier app responds with, thus we don't handle the response.
           * We just wait for 2 seconds before closing the connection and resetting the QR code.
           * In order to start a new flow a new QR code must be generated.
           */
          await Proximity.sendResponse(result);
          setLogBox('[ON_DOCUMENT_REQUEST_RECEIVED] Response sent]\n');
        }
      } catch (error) {
        const serErr = serializeError(error);
        setLogBox(`[ON_DOCUMENT_REQUEST_RECEIVED] error: ${serErr}\n`);

        await closeFlow(true); // Send error response to the verifier app
      }
    },
    [closeFlow, credentials, setLogBox]
  );

  /**
   * Function which initializes the QR engagement, generates the QR code and listens for incoming events
   * by registering the appropriate callbacks.
   */
  const startFlow = useCallback(async () => {
    try {
      resetLogBox();
      const permissions = await requestBlePermissions();
      if (!permissions) {
        throw new Error('Permissions not granted');
      }
      setLogBox('[INIT_PROXIMITY] Closing previous flow if any');
      await Proximity.close().catch(() => {}); // We can ignore errors here as we don't know if the flow started successfully previously
      await Proximity.start();
      setLogBox('[INIT_PROXIMITY] Flow started successfully');
      // Register listeners
      Proximity.addListener('onDeviceConnecting', handleOnDeviceConnecting);
      Proximity.addListener('onDeviceConnected', handleOnDeviceConnected);
      Proximity.addListener(
        'onDocumentRequestReceived',
        onDocumentRequestReceived
      );
      Proximity.addListener('onDeviceDisconnected', onDeviceDisconnected);
      Proximity.addListener('onError', onError);
      setQrCode(await Proximity.getQrCodeString());
    } catch (e) {
      setLogBox(`[INIT_PROXIMITY] error: ${serializeError(e)}`);
      await closeFlow().catch(); // We can ignore this error in this particular case as we don't even know if the flow started successfully.
    }
  }, [
    closeFlow,
    handleOnDeviceConnected,
    handleOnDeviceConnecting,
    onDeviceDisconnected,
    onDocumentRequestReceived,
    onError,
    resetLogBox,
    setLogBox
  ]);

  return {startFlow, closeFlow, qrCode, logBox};
};
