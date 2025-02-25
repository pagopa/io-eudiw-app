import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
import {Credential} from '@pagopa/io-react-native-wallet';
import {serializeError} from 'serialize-error';
import {
  AuthResponse,
  resetPresentation,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest,
  setPreDefinitionSuccess
} from '../store/presentation';
import {selectAttestation} from '../store/attestation';
import {selectCredentials} from '../store/credentials';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';

/**
 * Saga watcher for presentation related actions.
 */
export function* watchPresentationSaga() {
  yield* takeLatest([setPreDefinitionRequest], function* (...args) {
    yield* race({
      task: call(handlePresetationPreDefinition, ...args),
      cancel: take(resetPresentation)
    });
  });
}

/**
 * Saga for the credential presentation.
 * It listens for an action which stars the presentation flow.
 * The presentation is divided by two steps:
 * - Pre-definition: the app asks for the required claims to be presented to the RP;
 * - Post-definition: the app sends the required claims to the RP after identification.
 */
function* handlePresetationPreDefinition(
  action: ReturnType<typeof setPreDefinitionRequest>
) {
  try {
    // Gets the Wallet Instance Attestation from the persisted store
    const walletInstanceAttestation = yield* select(selectAttestation);
    if (!walletInstanceAttestation) {
      throw new Error('Wallet Instance Attestation not found');
    }
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

    const {presentationDefinition} = yield* call(
      Credential.Presentation.fetchPresentDefinition,
      requestObject
    );

    const credentials = yield* select(selectCredentials);

    /**
     * Array of tuples containg the credential keytag and its raw value
     */
    const credentialsSdJwt: Array<[string, string]> = credentials
      .filter(c => c.format === 'vc+sd-jwt')
      .map(c => [c.keyTag, c.credential]);
    const credentialsMdoc: Array<[string, string]> = credentials
      .filter(c => c.format === 'mso_mdoc')
      .map(c => [c.keyTag, c.credential]);

    const evaluateInputDescriptors = yield* call(
      Credential.Presentation.evaluateInputDescriptors,
      presentationDefinition.input_descriptors,
      credentialsSdJwt,
      credentialsMdoc
    );

    yield* put(setPreDefinitionSuccess(evaluateInputDescriptors));

    /* Wait for the user to confirm the presentation with the claims
     * No need to check for the cancel action as there's a race condition defined in watchPresentationSaga
     * The payload contains a list of the name of optionals claims to be presented
     */
    const {payload: optionalClaimsNames} = yield* take(
      setPostDefinitionRequest
    );

    yield* put(
      setIdentificationStarted({canResetPin: false, isValidatingTask: true})
    );

    const resAction = yield* take([
      setIdentificationIdentified,
      setIdentificationUnidentified
    ]);

    if (setIdentificationIdentified.match(resAction)) {
      const credentialAndInputDescriptor = evaluateInputDescriptors.map(
        evaluateInputDescriptor => {
          const requestedClaims = [
            ...evaluateInputDescriptor.evaluatedDisclosure.requiredDisclosures.map(
              item => item.decoded[1]
            ),
            ...optionalClaimsNames
          ];
          return {
            requestedClaims,
            inputDescriptor: evaluateInputDescriptor.inputDescriptor,
            credential: evaluateInputDescriptor.credential,
            keyTag: evaluateInputDescriptor.keyTag
          };
        }
      );

      const remotePresentations = yield* call(
        Credential.Presentation.prepareRemotePresentations,
        credentialAndInputDescriptor,
        requestObject.nonce,
        requestObject.client_id
      );

      const authResponse = yield* call(
        Credential.Presentation.sendAuthorizationResponse,
        requestObject,
        presentationDefinition.id,
        jwks.keys,
        remotePresentations
      );
      yield* put(setPostDefinitionSuccess(authResponse as AuthResponse));
    } else {
      throw new Error('Identification failed');
    }
  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({error: serializeError(e)}));
    yield* put(setPreDefinitionError({error: serializeError(e)}));
  }
}
