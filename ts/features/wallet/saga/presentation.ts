import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
import {
  createCryptoContextFor,
  Credential,
  SdJwt
} from '@pagopa/io-react-native-wallet';
import {InputDescriptor} from '@pagopa/io-react-native-wallet/lib/typescript/credential/presentation/types';
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
import {WIA_KEYTAG} from '../utils/crypto';
import {selectCredential} from '../store/credentials';
import {wellKnownCredential} from '../utils/credentials';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';

/**
 * Saga watcher for PID related actions.
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
 * Saga to store the PID credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the PID is stored and the lifecycle is set to `LIFECYCLE_VALID`.
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
    const qrcode = action.payload.url;

    const {requestURI} = Credential.Presentation.startFlowFromQR(qrcode);

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    const {requestObjectEncodedJwt} = yield* call(
      Credential.Presentation.getRequestObject,
      requestURI,
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

    yield* take(setPostDefinitionRequest);

    yield* put(
      setIdentificationStarted({canResetPin: false, isValidatingTask: true})
    );

    const resAction = yield* take([
      setIdentificationIdentified,
      setIdentificationUnidentified
    ]);

    if (setIdentificationIdentified.match(resAction)) {
      const disclosuresRequestedClaimName = [
        ...descriptorResult.requiredDisclosures.map(item => item.decoded[1])
      ];

      const credentialCryptoContext = createCryptoContextFor(pid.keyTag);

      const authResponse = yield* call(
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
  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({error: JSON.stringify(e)}));
    yield* put(setPreDefinitionError({error: JSON.stringify(e)}));
  }
}
