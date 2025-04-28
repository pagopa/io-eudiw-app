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
  yield* takeLatest(setPreDefinitionRequest, handlePresetationPreDefinition);
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

    /* Wait for the user to confirm the presentation with the claims or to cancel it
     *  - In case the user confirms the presentation, the payload will contain a list of the name of optionals claims to be presented
     *  - In case the user cancels the presentation, no payload will be needed
     */
    const choice = yield* take([
      setPostDefinitionRequest,
      setPostDefinitionCancel
    ]);

    if (setPostDefinitionRequest.match(choice)) {
      const {
        payload: {
          optionalChecked: optionalClaimsNames,
          requiredExcluded: excludedRequiredClaimsNames
        }
      } = choice;
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
              ...(excludedRequiredClaimsNames
                ? evaluateInputDescriptor.evaluatedDisclosure.requiredDisclosures.filter(
                    item => !excludedRequiredClaimsNames.includes(item.name)
                  )
                : evaluateInputDescriptor.evaluatedDisclosure
                    .requiredDisclosures
              ).map(item => item.name),
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

        const authRequestObject = {
          nonce: requestObject.nonce,
          clientId: requestObject.client_id,
          responseUri: requestObject.response_uri
        };

        const remotePresentations = yield* call(
          Credential.Presentation.prepareRemotePresentations,
          credentialAndInputDescriptor,
          authRequestObject
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
    } else {
      // The result of this call is ignored for the user is not interested in any message
      yield* call(() =>
        Credential.Presentation.sendAuthorizationErrorResponse(
          requestObject,
          'access_denied',
          jwks.keys
        )
          .then(() => {})
          .catch(() => {})
          .finally(() => {
            put(resetPresentation());
          })
      );
    }
  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({error: serializeError(e)}));
    yield* put(setPreDefinitionError({error: serializeError(e)}));
  }
}
