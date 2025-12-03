import {call, put, select, take, takeLatest} from 'typed-redux-saga';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import {serializeError} from 'serialize-error';
import {DisclosureWithEncoded} from '@pagopa/io-react-native-wallet/lib/typescript/sd-jwt/types';
import {CryptoContext} from '@pagopa/io-react-native-jwt';
import {
  AuthResponse,
  resetPresentation,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest
} from '../store/presentation';
import {selectCredentials} from '../store/credentials';
import {
  handleDcqlRequest,
  handleDcqlResponse,
  handlePresentationDefinitionRequest,
  handlePresentationDefinitionResponse,
  PresentationRequestProcessor,
  PresentationResponseProcessor,
  RequestObject
} from '../utils/presentation';
import {
  IdentificationResultTask,
  startSequentializedIdentificationProcess
} from '../../../saga/identification';

/**
 * Saga watcher for presentation related actions.
 */
export function* watchPresentationSaga() {
  yield* takeLatest(setPreDefinitionRequest, handlePresentationPreDefinition);
}

/**
 * Saga for the credential presentation.
 * It listens for an action which stars the presentation flow.
 * The presentation is divided by two steps:
 * - Pre-definition: the app asks for the required claims to be presented to the RP;
 * - Post-definition: the app sends the required claims to the RP after identification.
 */
function* handlePresentationPreDefinition(
  action: ReturnType<typeof setPreDefinitionRequest>
) {
  try {
    const {request_uri, client_id, state, request_uri_method} = action.payload;

    const qrParameters = yield* call(Credential.Presentation.startFlowFromQR, {
      request_uri,
      client_id,
      state,
      request_uri_method
    });

    const {requestObjectEncodedJwt} = yield* call(
      Credential.Presentation.getRequestObject,
      qrParameters.request_uri
    );

    const {rpConf, subject} = yield* call(
      Credential.Presentation.evaluateRelyingPartyTrust,
      qrParameters.client_id
    );

    const {requestObject} = yield* call(
      Credential.Presentation.verifyRequestObject,
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId: qrParameters.client_id,
        rpSubject: subject,
        state: qrParameters.state
      }
    );

    const credentials = yield* select(selectCredentials);

    /**
     * Array of tuples containg the credential keytag and its raw value
     */
    const credentialsSdJwt = [
      ...Object.values(credentials)
        .filter(c => c.format === 'dc+sd-jwt' || c.format === 'vc+sd-jwt')
        .map(c => [createCryptoContextFor(c.keyTag), c.credential])
    ] as Array<[CryptoContext, string]>;

    /*
     * Based on the type of request, the {@link handleResponse} function is called with
     * different processing methods, keeping the common flow structure
     */
    yield* requestObject.dcql_query
      ? call(
          handleResponse,
          requestObject,
          credentialsSdJwt,
          handleDcqlRequest,
          handleDcqlResponse
        )
      : call(
          handleResponse,
          requestObject,
          credentialsSdJwt,
          handlePresentationDefinitionRequest,
          handlePresentationDefinitionResponse
        );
  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({error: serializeError(e)}));
    yield* put(setPreDefinitionError({error: serializeError(e)}));
  }
}
/**
 * This helper function performs the credentials' presentation in case of correct identification of the wallet owner
 * @param responseProcessor The same parameter with which {@link handleResponse} was called
 * @param processedRequest The {@link RequestObject} processed by {@link handleResponse}'s requestProcessor param
 * @param requestObject The presentation's {@link RequestObject}
 * @param optionalClaims An {@link EvaluatedDisclosure[]} of the optional disclosures the user chose to share
 * @param jwks The same parameter with which {@link handleResponse} was called
 */
function* onPresentCredentialIdentified<T>(
  responseProcessor: Parameters<typeof handleResponse<T>>[3],
  processedRequest: T,
  requestObject: Parameters<typeof handleResponse<T>>[0],
  optionalClaims: Array<DisclosureWithEncoded>
) {
  const authResponse: AuthResponse = yield call(
    responseProcessor,
    processedRequest,
    requestObject,
    optionalClaims
  );

  yield* put(setPostDefinitionSuccess(authResponse as AuthResponse));
}

/**
 * This helper function handles the case in which the wallet owner could not be authenticated during a presentation
 */
function* onPresentCredentialUnidentified() {
  throw new Error('Identification failed');
}

/**
 * Helper function that generalizes the last part of a Presentation flow, handling only common user interaction with the saga
 * and delegating the formation of the response to the specific Presentation standard (e.g. DCQL or Presentation Definition)
 */
function* handleResponse<T>(
  requestObject: RequestObject,
  credentialsSdJwt: Array<[CryptoContext, string]>,
  requestProcessor: PresentationRequestProcessor<T>,
  responseProcessor: PresentationResponseProcessor<T>
) {
  const processedRequest: T = yield call(
    requestProcessor,
    requestObject,
    credentialsSdJwt
  );

  /* Wait for the user to confirm the presentation with the claims or to cancel it
   *  - In case the user confirms the presentation, the payload will contain a list of the name of optionals claims to be presented
   *  - In case the user cancels the presentation, no payload will be needed
   */
  const choice = yield* take([
    setPostDefinitionRequest,
    setPostDefinitionCancel
  ]);

  if (setPostDefinitionRequest.match(choice)) {
    const {payload: optionalClaims} = choice;

    const onIdentifiedTask: IdentificationResultTask<
      typeof onPresentCredentialIdentified<T>
    > = {
      fn: onPresentCredentialIdentified<T>,
      args: [responseProcessor, processedRequest, requestObject, optionalClaims]
    };

    const onUnidentifiedTask: IdentificationResultTask<
      typeof onPresentCredentialUnidentified
    > = {
      fn: onPresentCredentialUnidentified,
      args: []
    };

    yield* call(
      startSequentializedIdentificationProcess,
      {
        canResetPin: false,
        isValidatingTask: true
      },
      /**
       * Inline because the function closure needs the {@link action} parameter,
       * and typescript's inference does not work properly on a function builder
       * that builds and returns the callback
       */
      onIdentifiedTask,
      onUnidentifiedTask
    );
  } else {
    // The result of this call is ignored for the user is not interested in any message
    yield* call(() =>
      Credential.Presentation.sendAuthorizationErrorResponse(requestObject, {
        error: 'invalid_request_object',
        errorDescription: 'Mock error during request object validation'
      })
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          put(resetPresentation());
        })
    );
  }
}
