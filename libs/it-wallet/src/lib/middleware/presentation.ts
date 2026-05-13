import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import { selectCredentials } from '../store/credentials';
import {
  resetPresentation,
  selectOptionalCredentials,
  setCredentialNotFound,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest,
  setPreDefinitionSuccess
} from '../store/presentation';
import {
  getConfigIdByVct,
  wellKnownCredentialConfigurationIDs
} from '../utils/credentials';
import { enrichPresentationDetails } from '../utils/itwClaimsUtils';
import { AppListenerWithAction, AppStartListening } from './types';
import { takeLatestEffect } from '@io-eudiw-app/commons';
import { serializeError } from 'serialize-error';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import {
  IoWallet,
  RemotePresentation
} from '@io-eudiw-app/io-react-native-wallet';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { getWalletInstanceAttestationThunk } from './attestation';
import { getInvalidCredentials } from '../utils/itwCredentialStatusUtils';

type DcqlQuery = Parameters<
  RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']
>[0];

/**
 * Listener for the credential presentation.
 * It listens for an action which stars the presentation flow.
 * The presentation is divided by two steps:
 * - Pre-definition: the app asks for the required claims to be presented to the RP;
 * - Post-definition: the app sends the required claims to the RP after identification.
 */
const presentationListener: AppListenerWithAction<
  ReturnType<typeof setPreDefinitionRequest>
> = async (action, listenerApi) => {
  try {
    const { request_uri, client_id, state, request_uri_method } =
      action.payload;

    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });

    await listenerApi.dispatch(getWalletInstanceAttestationThunk());

    const qrParams = wallet.RemotePresentation.startFlowFromQR({
      request_uri,
      client_id,
      state,
      request_uri_method: request_uri_method as 'get' | 'post'
    });

    const { rpConf } =
      await wallet.RemotePresentation.evaluateRelyingPartyTrust(
        qrParams.client_id
      );

    if (!qrParams.request_uri) {
      throw new Error(
        'Only request_uri based Remote Presentation Requests are supported'
      );
    }

    const { requestObjectEncodedJwt } =
      await wallet.RemotePresentation.getRequestObject(qrParams.request_uri);

    const { requestObject } =
      await wallet.RemotePresentation.verifyRequestObject(
        requestObjectEncodedJwt,
        {
          rpConf,
          clientId: qrParams.client_id,
          state: qrParams.state
        }
      );

    const credentials = selectCredentials(listenerApi.getState());

    /**
     * Array of tuples containg the credential keytag and its raw value
     */
    const credentialsSdJwt = [
      ...Object.values(credentials)
        .filter(c => c.format === 'dc+sd-jwt')
        .map(c => [c.keyTag, c.credential])
    ] as Array<[string, string]>;

    if (!requestObject.dcql_query) {
      throw new Error('Only DCQL presentations are supported at the moment');
    }

    const evaluatedDcqlQuery =
      await wallet.RemotePresentation.evaluateDcqlQuery(
        requestObject.dcql_query as DcqlQuery,
        credentialsSdJwt
      );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(
      evaluatedDcqlQuery,
      credentials
    );

    if (invalidCredentials.length > 0) {
      throw new Error(
        `No credential found for the required VC type: ${invalidCredentials}`
      );
    }

    // Add localization to the requested claims
    const presentationDetails = enrichPresentationDetails(
      evaluatedDcqlQuery,
      credentials
    );

    listenerApi.dispatch(
      setPreDefinitionSuccess({
        descriptor: presentationDetails,
        rpConfig: rpConf.federation_entity
      })
    );

    /* Wait for the user to confirm the presentation with the claims or to cancel it
     *  - In case the user confirms the presentation, the payload will contain a list of the name of optionals claims to be presented
     *  - In case the user cancels the presentation, no payload will be needed
     */
    const choice = await listenerApi.take(
      isAnyOf(setPostDefinitionRequest, setPostDefinitionCancel)
    );
    const optionalCredentials = selectOptionalCredentials(
      listenerApi.getState()
    );

    if (setPostDefinitionRequest.match(choice[0])) {
      listenerApi.dispatch(
        setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
      );
      const resAction = await listenerApi.take(
        isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
      );
      if (setIdentificationIdentified.match(resAction[0])) {
        const credentialsToPresent = evaluatedDcqlQuery
          .filter(
            c =>
              c.purposes.some(({ required }) => required) ||
              optionalCredentials?.includes(c.id)
          )
          .map(({ requiredDisclosures, ...rest }) => ({
            ...rest,
            requestedClaims: requiredDisclosures.map(({ name }) => name)
          }));

        const authRequestObject = {
          nonce: requestObject.nonce,
          clientId: requestObject.client_id,
          responseUri: requestObject.response_uri
        };

        const remotePresentations =
          await wallet.RemotePresentation.prepareRemotePresentations(
            credentialsToPresent,
            authRequestObject
          );

        const authResponse =
          await wallet.RemotePresentation.sendAuthorizationResponse(
            requestObject,
            remotePresentations,
            rpConf
          );
        listenerApi.dispatch(setPostDefinitionSuccess(authResponse));
      } else {
        throw new Error('Identification failed');
      }
    } else {
      // The result of this call is ignored for the user is not interested in any message
      wallet.RemotePresentation.sendAuthorizationErrorResponse(requestObject, {
        error: 'access_denied',
        errorDescription: 'The user cancelled the presentation.'
      })
        .then(() => null)
        .catch(() => null)
        .finally(() => {
          listenerApi.dispatch(resetPresentation());
        });
    }
  } catch (error) {
    if (error instanceof TaskAbortError) {
      return;
    }
    const serialized = serializeError(error);
    // Handle the case where a credential required by the DCQL query is not in the wallet
    if (error instanceof RemotePresentation.Errors.CredentialsNotFoundError) {
      const firstMissingNonPid = error.details.find(
        detail =>
          detail.format !== 'mso_mdoc' &&
          getConfigIdByVct(detail.vctValues ?? []) !==
            wellKnownCredentialConfigurationIDs.PID
      );
      const firstMissing = firstMissingNonPid ?? error.details[0];
      const configId =
        firstMissing?.format !== 'mso_mdoc' && firstMissing?.vctValues?.length
          ? getConfigIdByVct(firstMissing.vctValues)
          : undefined;
      if (configId) {
        listenerApi.dispatch(setCredentialNotFound(configId));
      }
      listenerApi.dispatch(setPreDefinitionError({ error: serialized }));
      return;
    }
    // We don't know which step is failed thus we set the same error for both
    listenerApi.dispatch(setPostDefinitionError({ error: serialized }));
    listenerApi.dispatch(setPreDefinitionError({ error: serialized }));
  }
};

export const addPresentationListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: setPreDefinitionRequest,
    effect: takeLatestEffect(presentationListener)
  });
};
