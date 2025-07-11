import {call, put, select, take, takeLatest} from 'typed-redux-saga';
import {Credential} from '@pagopa/io-react-native-wallet';
import {serializeError} from 'serialize-error';
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
  JWK,
  PresentationRequestProcessor,
  PresentationResponseProcessor,
  RequestObject
} from '../utils/presentation';
import {startSequentializedIdentificationProcess} from '../../../utils/identification';

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
    const {request_uri, client_id} = action.payload;

    const {requestUri} = yield* call(
      Credential.Presentation.startFlowFromQR,
      request_uri,
      client_id
    );

    const {requestObjectEncodedJwt} = yield* call(
      Credential.Presentation.getRequestObject,
      requestUri
    );

    const jwks = yield* call(
      Credential.Presentation.fetchJwksFromRequestObject,
      requestObjectEncodedJwt
    );

    const {requestObject} = yield* call(
      Credential.Presentation.verifyRequestObjectSignature,
      requestObjectEncodedJwt,
      jwks.keys
    );

    const credentials = yield* select(selectCredentials);

    /**
     * Array of tuples containg the credential keytag and its raw value
     */
    const credentialsSdJwt: Array<[string, string, string]> = credentials
      .filter(c => c.format === 'vc+sd-jwt')
      .map(c => [c.credentialType, c.keyTag, c.credential]);
    const credentialsMdoc: Array<[string, string, string]> = credentials
      .filter(c => c.format === 'mso_mdoc')
      .map(c => [c.credentialType, c.keyTag, c.credential]);

    /*
     * Based on the type of request, the {@link handleResponse} function is called with
     * different processing methods, keeping the common flow structure
     */
    yield* requestObject.dcql_query
      ? call(
          handleResponse,
          requestObject,
          credentialsSdJwt,
          credentialsMdoc,
          jwks.keys,
          handleDcqlRequest,
          handleDcqlResponse
        )
      : call(
          handleResponse,
          requestObject,
          credentialsSdJwt,
          credentialsMdoc,
          jwks.keys,
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
 * Helper function that generalizes the last part of a Presentation flow, handling only common user interaction with the saga
 * and delegating the formation of the response to the specific Presentation standard (e.g. DCQL or Presentation Definition)
 */
function* handleResponse<T>(
  requestObject: RequestObject,
  credentialsSdJwt: Array<[string, string, string]>,
  credentialsMdoc: Array<[string, string, string]>,
  jwks: Array<JWK>,
  requestProcessor: PresentationRequestProcessor<T>,
  responseProcessor: PresentationResponseProcessor<T>
) {
  const processedRequest: T = yield call(
    requestProcessor,
    requestObject,
    credentialsSdJwt,
    credentialsMdoc
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
      function* () {
        const authResponse: AuthResponse = yield call(
          responseProcessor,
          processedRequest,
          requestObject,
          optionalClaims,
          jwks
        );

        yield* put(setPostDefinitionSuccess(authResponse as AuthResponse));
      },
      function* () {
        throw new Error('Identification failed');
      }
    );
  } else {
    // The result of this call is ignored for the user is not interested in any message
    yield* call(() =>
      Credential.Presentation.sendAuthorizationErrorResponse(
        requestObject,
        'access_denied',
        jwks
      )
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          put(resetPresentation());
        })
    );
  }
}
