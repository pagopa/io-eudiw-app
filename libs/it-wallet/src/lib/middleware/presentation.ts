import { CryptoContext } from '@pagopa/io-react-native-jwt';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
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
import { getInvalidCredentials } from '../utils/itwCredentialStatusUtils';
import { itwCredentialVault } from '../utils/itwCredentialVault';
import { AppListenerWithAction, AppStartListening } from './types';
import { takeLatestEffect } from '@io-eudiw-app/commons';
import { serializeError } from 'serialize-error';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';

type DcqlQuery = Parameters<Credential.Presentation.EvaluateDcqlQuery>[1];

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

    const qrParameters = Credential.Presentation.startFlowFromQR({
      request_uri,
      client_id,
      state,
      request_uri_method
    });

    const { requestObjectEncodedJwt } =
      await Credential.Presentation.getRequestObject(qrParameters.request_uri);

    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(
        qrParameters.client_id
      );

    const { requestObject } = await Credential.Presentation.verifyRequestObject(
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId: qrParameters.client_id,
        rpSubject: subject,
        state: qrParameters.state
      }
    );

    const credentials = selectCredentials(listenerApi.getState());

    /**
     * Array of tuples containg the credential keytag and its raw value.
     * The encoded SD-JWT is retrieved from the secure vault on demand.
     */
    const sdJwtMetadata = credentials.filter(c => c.format === 'dc+sd-jwt');
    const credentialsSdJwt: Array<[CryptoContext, string]> = await Promise.all(
      sdJwtMetadata.map(async c => {
        const encoded = await itwCredentialVault.get(c.credentialType);
        if (!encoded) {
          throw new Error(
            `Encoded credential missing in vault for ${c.credentialType}`
          );
        }
        return [createCryptoContextFor(c.keyTag), encoded];
      })
    );

    if (!requestObject.dcql_query) {
      throw new Error('Only DCQL presentations are supported at the moment');
    }

    const evaluateDcqlQuery = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(
      evaluateDcqlQuery,
      credentials
    );

    if (invalidCredentials.length > 0) {
      throw new Error(
        `No credential found for the required VC type: ${invalidCredentials}`
      );
    }

    // Add localization to the requested claims
    const presentationDetails = enrichPresentationDetails(
      evaluateDcqlQuery,
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
        const credentialsToPresent = evaluateDcqlQuery
          .filter(
            c =>
              c.purposes.some(({ required }) => required) ||
              optionalCredentials?.includes(c.id)
          )
          .map(({ requiredDisclosures, ...rest }) => ({
            ...rest,
            requestedClaims: requiredDisclosures.map(
              ([, claimName]) => claimName
            )
          }));

        const remotePresentations =
          await Credential.Presentation.prepareRemotePresentations(
            credentialsToPresent,
            requestObject.nonce,
            requestObject.client_id
          );

        const authResponse =
          await Credential.Presentation.sendAuthorizationResponse(
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
      Credential.Presentation.sendAuthorizationErrorResponse(requestObject, {
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
    if (
      error instanceof Credential.Presentation.Errors.CredentialsNotFoundError
    ) {
      const firstMissingNonPid = error.details.find(
        ({ vctValues }) =>
          getConfigIdByVct(vctValues ?? []) !==
          wellKnownCredentialConfigurationIDs.PID
      );
      const firstMissing = firstMissingNonPid ?? error.details[0];
      const configId = firstMissing?.vctValues?.length
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
