import { takeLatestEffect } from '@io-eudiw-app/commons';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import {
  IoWallet,
  RemotePresentation,
  type Signer
} from '@pagopa/io-react-native-wallet';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';

import { selectCredentials } from '../store/credentials';
import {
  selectIsRemoteKeyLocked,
  selectSessionId,
  setHsmPasswordRemainingAttempts,
  setRemoteKeyLocked
} from '../store/instance';
import { lifecycleIsOperationalSelector } from '../store/lifecycle';
import {
  resetPresentation,
  selectOptionalCredentials,
  setCredentialNotFound,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionStep,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest,
  setPreDefinitionSuccess,
  setPresentationHsmPassword
} from '../store/presentation';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import {
  getConfigIdByVct,
  wellKnownCredentialConfigurationIDs
} from '../utils/credentials';
import { createCredentialSigner } from '../utils/crypto';
import { serializeErrorOrUnknown } from '../utils/errors';
import { enrichPresentationDetails } from '../utils/itwClaimsUtils';
import { getInvalidCredentials } from '../utils/itwCredentialStatusUtils';
import { CredentialsVault } from '../utils/itwCredentialVault';
import {
  createRemoteSignerFor,
  getHsmPasswordRemainingAttempts,
  isRemoteKeyLockedError,
  type RemoteKey
} from '../utils/remoteCrypto';
import { getWalletInstanceAttestationThunk } from './attestation';
import { AppListener, AppListenerWithAction, AppStartListening } from './types';

type DcqlQuery = Parameters<
  RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']
>[0];

type EvaluatedDcqlQuery = Awaited<
  ReturnType<RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']>
>;

type RemotePresentations = Awaited<
  ReturnType<
    RemotePresentation.RemotePresentationApi['prepareRemotePresentations']
  >
>;

/**
 * Error thrown when a presentation is started while the Remote WSCD key is locked.
 */
class RemoteKeyLockedError extends Error {
  constructor() {
    super('The Remote WSCD keys are locked');
    this.name = 'RemoteKeyLockedError';
  }
}

/**
 * Authorizes the presentation of the credentials and prepares their presentations.
 * Credentials bound to a Remote WSCD key are authorized by the IT-Wallet password, which is asked again while it is wrong,
 * the others by the app identification.
 * @param listenerApi - The listener API
 * @param credentialsToPresent - The credentials to present, with their signers
 * @param remoteKeys - The Remote WSCD keys bound to the signers
 * @param prepare - Prepares the presentations of the credentials
 * @returns the presentations, or undefined if the user cancelled the presentation
 * @throws if the identification fails or the Remote WSCD keys get locked
 */
const authorizePresentations = async (
  listenerApi: AppListener,
  credentialsToPresent: EvaluatedDcqlQuery,
  remoteKeys: Map<Signer, RemoteKey>,
  prepare: (items: EvaluatedDcqlQuery) => Promise<RemotePresentations>
): Promise<RemotePresentations | undefined> => {
  const { dispatch, getState, take } = listenerApi;

  if (!credentialsToPresent.some(c => remoteKeys.has(c.signer))) {
    dispatch(
      setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
    );
    const [resAction] = await take(
      isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
    );
    if (!setIdentificationIdentified.match(resAction)) {
      throw new Error('Identification failed');
    }
    dispatch(setPostDefinitionStep('sending'));
    return prepare(credentialsToPresent);
  }

  const sessionId = selectSessionId(getState());
  for (;;) {
    const passwordAction = take(
      isAnyOf(setPresentationHsmPassword, setPostDefinitionCancel)
    );
    dispatch(setPostDefinitionStep('hsmPasswordRequired'));
    const [action] = await passwordAction;
    if (!setPresentationHsmPassword.match(action)) {
      return undefined;
    }
    dispatch(setPostDefinitionStep('authorizing'));
    const { password } = action.payload;
    try {
      const presentations = await prepare(
        credentialsToPresent.map(c => {
          const remoteKey = remoteKeys.get(c.signer);
          return remoteKey
            ? {
                ...c,
                signer: createRemoteSignerFor(
                  remoteKey,
                  async () => password,
                  sessionId
                )
              }
            : c;
        })
      );
      // A correct password resets the attempts
      dispatch(setHsmPasswordRemainingAttempts(undefined));
      dispatch(setPostDefinitionStep('sending'));
      return presentations;
    } catch (error) {
      const remainingAttempts = getHsmPasswordRemainingAttempts(error);
      if (remainingAttempts === undefined) {
        throw error;
      }
      dispatch(setHsmPasswordRemainingAttempts(remainingAttempts));
    }
  }
};

/**
 * Dispatches the error of the presentation flow, distinguishing the cases which have a dedicated screen.
 */
const handlePresentationError = (error: unknown, listenerApi: AppListener) => {
  const serialized = serializeErrorOrUnknown(error);
  // The Remote WSCD keys were already locked when the presentation started
  if (error instanceof RemoteKeyLockedError) {
    listenerApi.dispatch(
      setPreDefinitionError({ error: serialized, type: 'REMOTE_KEY_LOCKED' })
    );
    return;
  }
  // The third wrong IT-Wallet password locks the Remote WSCD keys, thus the identity must be confirmed again
  if (isRemoteKeyLockedError(error)) {
    listenerApi.dispatch(setRemoteKeyLocked());
    listenerApi.dispatch(
      setPostDefinitionError({ error: serialized, type: 'REMOTE_KEY_LOCKED' })
    );
    return;
  }
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
        error: serialized,
        type: 'CREDENTIAL_NOT_FOUND'
      })
    );
    return;
  }
  // We don't know which step is failed thus we set the same error for both
  listenerApi.dispatch(
    setPostDefinitionError({ error: serialized, type: 'PRESENTATION_ERROR' })
  );
  listenerApi.dispatch(
    setPreDefinitionError({ error: serialized, type: 'PRESENTATION_ERROR' })
  );
};

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
    const { client_id, request_uri, request_uri_method, state } =
      action.payload;

    if (lifecycleIsOperationalSelector(listenerApi.getState())) {
      listenerApi.dispatch(
        setPreDefinitionError({
          error: serializeErrorOrUnknown(new Error('Wallet is not active')),
          type: 'WALLET_NOT_ACTIVE'
        })
      );
      return;
    }

    // While the Remote WSCD key is locked every presentation is blocked until the ID is recovered
    if (selectIsRemoteKeyLocked(listenerApi.getState())) {
      throw new RemoteKeyLockedError();
    }

    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });

    await listenerApi.dispatch(getWalletInstanceAttestationThunk());

    const qrParams = wallet.RemotePresentation.startFlowFromQR({
      client_id,
      request_uri,
      request_uri_method: request_uri_method ?? 'get',
      state
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
    const sessionId = selectSessionId(listenerApi.getState());

    // Remote WSCD keys bound to the signers, which are replaced once the user enters the IT-Wallet password
    const remoteKeys = new Map<Signer, RemoteKey>();

    /**
     * Array of tuples containing the credential signer and its raw value.
     * The encoded SD-JWT is retrieved from the secure vault on demand.
     */
    const credentialsSdJwt: [Signer, string][] = (
      await Promise.all(
        credentials
          .filter(c => c.format === 'dc+sd-jwt')
          .map(async c => {
            const encoded = await CredentialsVault.get(c.credentialType);
            if (!encoded) {
              return null;
            }
            const signer = createCredentialSigner(c, sessionId);
            if (c.remoteKey) {
              remoteKeys.set(signer, c.remoteKey);
            }
            return [signer, encoded] as [Signer, string];
          })
      )
    ).filter((x): x is [Signer, string] => x !== null);

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
      const idsToPresent = presentationDetails
        .filter(
          c =>
            c.purposes.some(({ required }) => required) ||
            optionalCredentials?.includes(c.id)
        )
        .map(c => c.id);
      // Signers are not kept in the store, so pick them from the evaluated query
      const credentialsToPresent = evaluatedDcqlQuery.filter(c =>
        idsToPresent.includes(c.id)
      );

      const remotePresentations = await authorizePresentations(
        listenerApi,
        credentialsToPresent,
        remoteKeys,
        items =>
          wallet.RemotePresentation.prepareRemotePresentations(
            items,
            requestObject
          )
      );

      if (remotePresentations) {
        const authResponse =
          await wallet.RemotePresentation.sendAuthorizationResponse(
            requestObject,
            remotePresentations
          );
        listenerApi.dispatch(setPostDefinitionSuccess(authResponse));
        return;
      }
    }
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
  } catch (error) {
    if (!(error instanceof TaskAbortError)) {
      handlePresentationError(error, listenerApi);
    }
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
