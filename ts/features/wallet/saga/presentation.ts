import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
import {
  createCryptoContextFor,
  Credential,
  SdJwt
} from '@pagopa/io-react-native-wallet';
import {InputDescriptor} from '@pagopa/io-react-native-wallet/lib/typescript/credential/presentation/types';
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
import {WIA_KEYTAG} from '../utils/crypto';
import {selectCredential} from '../store/credentials';
import {wellKnownCredential} from '../utils/credentials';
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

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    const {requestUri} = yield* call(
      Credential.Presentation.startFlowFromQR,
      request_uri,
      client_id
    );

    const {requestObjectEncodedJwt} = yield* call(
      Credential.Presentation.getRequestObject,
      requestUri,
      {
        wiaCryptoContext,
        walletInstanceAttestation
      }
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

    // We suppose that request is about PID
    // In this case no check about other credentials
    const pid = yield* select(selectCredential(wellKnownCredential.PID));
    if (!pid) {
      throw new Error('PID not found');
    }

    const pidCredentialJwt = SdJwt.decode(pid.credential);

    // We support only one credential for now, we get first input_descriptor
    const inputDescriptor =
      presentationDefinition.input_descriptors[0] ||
      ({} as unknown as InputDescriptor);

    const descriptorResult =
      Credential.Presentation.evaluateInputDescriptorForSdJwt4VC(
        inputDescriptor,
        pidCredentialJwt.sdJwt.payload,
        pidCredentialJwt.disclosures
      );

    yield* put(setPreDefinitionSuccess(descriptorResult));

    /* Wait for the user to confirm the presentation with the claims
     * No need to check for the cancel action as there's a race condition defined in watchPresentationSaga
     * The payload contains a list of the name of optionals claims to be presented
     */
    const choice = yield* take([
      setPostDefinitionRequest,
      setPostDefinitionCancel
    ]);

    if (setPostDefinitionRequest.match(choice)) {
      const {payload : optionalClaimsNames} = choice ;
      yield* put(
        setIdentificationStarted({canResetPin: false, isValidatingTask: true})
      );

      const resAction = yield* take([
        setIdentificationIdentified,
        setIdentificationUnidentified
      ]);

      if (setIdentificationIdentified.match(resAction)) {
        const disclosuresRequestedClaimName = [
          ...descriptorResult.requiredDisclosures.map(item => item.decoded[1]),
          ...optionalClaimsNames
        ];

        const credentialCryptoContext = createCryptoContextFor(pid.keyTag);

        /**
         * Ignoring TS as typed-redux-saga doesn't seem to digest correctly a tuple of arguments.
         * This works as expected though.
         */
        const authResponse = yield* call(
          // @ts-ignore
          Credential.Presentation.sendAuthorizationResponse,
          requestObject,
          presentationDefinition,
          jwks.keys,
          [pid.credential, disclosuresRequestedClaimName, credentialCryptoContext]
        );
        yield* put(setPostDefinitionSuccess(authResponse as AuthResponse));
      } else {
        throw new Error('Identification failed');
      }
    } else {
        /**
         * Ignoring TS as typed-redux-saga doesn't seem to digest correctly a tuple of arguments.
         * This works as expected though.
         */
        const authResponse = yield* call(
          // @ts-ignore
          Credential.Presentation.sendAuthorizationErrorResponse,
          requestObject,
          'access_denied',
          jwks.keys
        );
        yield* put(setPostDefinitionSuccess(authResponse as AuthResponse));
    }

  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({error: serializeError(e)}));
    yield* put(setPreDefinitionError({error: serializeError(e)}));
  }
}
