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
import { AppListenerWithAction, AppStartListening } from './types';
import { takeLatestEffect } from '@io-eudiw-app/commons';
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
import { CredentialsVault } from '../utils/itwCredentialVault';
import { getWalletInstanceAttestationThunk } from './attestation';
import { serializeErrorOrUnknown } from '../utils/errors';
import { lifecycleIsOperationalSelector } from '../store/lifecycle';

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

    if (lifecycleIsOperationalSelector(listenerApi.getState())) {
      listenerApi.dispatch(
        setPreDefinitionError({
          type: 'WALLET_NOT_ACTIVE',
          error: serializeErrorOrUnknown(new Error('Wallet is not active'))
        })
      );
      return;
    }

    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });

    await listenerApi.dispatch(getWalletInstanceAttestationThunk());

    const qrParams = wallet.RemotePresentation.startFlowFromQR({
      request_uri,
      client_id,
      state,
      request_uri_method: request_uri_method ?? 'get'
    });

    if (!qrParams.request_uri) {
      throw new Error(
        'Only request_uri based Remote Presentation Requests are supported'
      );
    }

    const authRequestUrl = `haip://presentation?${new URLSearchParams(qrParams)}`;

    const { requestObjectEncodedJwt } =
      await wallet.RemotePresentation.getRequestObject(authRequestUrl);

    const { requestObject } =
      await wallet.RemotePresentation.verifyRequestObject(
        requestObjectEncodedJwt,
        {
          clientId: qrParams.client_id,
          state: qrParams.state
        }
      );

    const credentials = selectCredentials(listenerApi.getState());

    /**
     * Array of tuples containing the credential keytag and its raw value.
     * The encoded SD-JWT is retrieved from the secure vault on demand.
     */
    const credentialsSdJwt: Array<[string, string]> = (
      await Promise.all(
        credentials
          .filter(c => c.format === 'dc+sd-jwt')
          .map(async c => {
            const encoded = await CredentialsVault.get(c.credentialType);
            return encoded ? ([c.keyTag, encoded] as [string, string]) : null;
          })
      )
    ).filter((x): x is [string, string] => x !== null);

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
        descriptor: presentationDetails
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
        const credentialsToPresent = presentationDetails.filter(
          c =>
            c.purposes.some(({ required }) => required) ||
            optionalCredentials?.includes(c.id)
        );

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
            remotePresentations
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
    const serialized = serializeErrorOrUnknown(error);
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
      listenerApi.dispatch(
        setPreDefinitionError({
          type: 'CREDENTIAL_NOT_FOUND',
          error: serialized
        })
      );
      return;
    }
    // We don't know which step is failed thus we set the same error for both
    listenerApi.dispatch(
      setPostDefinitionError({ type: 'PRESENTATION_ERROR', error: serialized })
    );
    listenerApi.dispatch(
      setPreDefinitionError({ type: 'PRESENTATION_ERROR', error: serialized })
    );
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
