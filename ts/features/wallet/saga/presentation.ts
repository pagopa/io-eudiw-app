import { call, put, select, take, takeLatest } from 'typed-redux-saga';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import { serializeError } from 'serialize-error';
import { CryptoContext } from '@pagopa/io-react-native-jwt';
import {
  resetPresentation,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest,
  setPreDefinitionSuccess
} from '../store/presentation';
import { selectCredentials } from '../store/credentials';
import {
  IdentificationResultTask,
  startSequentializedIdentificationProcess
} from '../../../saga/identification';
import { CredentialTypePresentationClaimsListDescriptor } from '../components/presentation/CredentialTypePresentationClaimsList';
import { ParsedCredential } from '../utils/itwTypesUtils';

type DcqlQuery = Parameters<Credential.Presentation.EvaluateDcqlQuery>[1];
type EvaluateDcqlReturn = Awaited<
  ReturnType<typeof Credential.Presentation.evaluateDcqlQuery>
>;

/**
 * Saga watcher for presentation related actions.
 */
export function* watchPresentationSaga() {
  yield* takeLatest(setPreDefinitionRequest, handlePresentationPreDefinition);
}

type RequiredDisclosure = [string, string, unknown];

/**
 * Transforms a list of required disclosures and a parsed credential into a formatted object.
 * This function maps each required disclosure to its corresponding parsed claim, normalizes
 * multilingual claim names, and groups them under the provided credential type.
 *
 * @param requiredDisclosures - An array of tuples containing the claim ID and claim name that must be disclosed.
 * @param parsedCredential - The parsed credential object containing claim data extracted from the credential.
 * @param credentialType - The type of credential under which the transformed claims should be nested.
 * @returns A {@link PIDObject} containing the structured claims mapped to the given credential type.
 */
export function transformDescriptorObject(
  requiredDisclosures: Array<RequiredDisclosure>,
  parsedCredential: ParsedCredential,
  credentialType: string
): CredentialTypePresentationClaimsListDescriptor {
  const claims = requiredDisclosures.reduce<
    CredentialTypePresentationClaimsListDescriptor['string']
  >((acc, [_, claimName]) => {
    const parsed = parsedCredential[claimName];

    return {
      ...acc,
      ['unused']: {
        ...acc.unused,
        [claimName]: parsed
      }
    };
  }, {});

  return {
    [credentialType]: claims
  };
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
    const { request_uri, client_id, state, request_uri_method } =
      action.payload;

    const qrParameters = yield* call(Credential.Presentation.startFlowFromQR, {
      request_uri,
      client_id,
      state,
      request_uri_method
    });

    const { requestObjectEncodedJwt } = yield* call(
      Credential.Presentation.getRequestObject,
      qrParameters.request_uri
    );

    const { rpConf, subject } = yield* call(
      Credential.Presentation.evaluateRelyingPartyTrust,
      qrParameters.client_id
    );

    const { requestObject } = yield* call(
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
        .filter(c => c.format === 'dc+sd-jwt')
        .map(c => [createCryptoContextFor(c.keyTag), c.credential])
    ] as Array<[CryptoContext, string]>;

    if (!requestObject.dcql_query) {
      throw new Error('Only DCQL presentations are supported at the moment');
    }

    const evaluateDcqlQuery = yield* call(
      Credential.Presentation.evaluateDcqlQuery,
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    const allCredentials = yield* select(selectCredentials);
    const sdJwtCredentials = allCredentials.filter(
      credential =>
        credential.format === 'dc+sd-jwt' || credential.format === 'vc+sd-jwt'
    );

    yield* put(
      setPreDefinitionSuccess({
        descriptor: evaluateDcqlQuery
          .map(query => {
            const sdJwtFoundCredential = sdJwtCredentials.find(
              cred => cred.credentialType === query.vct
            );

            if (!sdJwtFoundCredential) {
              throw new Error(
                `No credential found for the required VC type: ${query.vct}`
              );
            }

            return transformDescriptorObject(
              query.requiredDisclosures,
              sdJwtFoundCredential.parsedCredential,
              sdJwtFoundCredential.credentialType
            );
          })
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        rpConfig: rpConf.federation_entity
      })
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
      const onIdentifiedTask: IdentificationResultTask<
        typeof onPresentCredentialIdentified
      > = {
        fn: onPresentCredentialIdentified,
        args: [evaluateDcqlQuery, requestObject]
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
          error: 'access_denied',
          errorDescription: 'The user cancelled the presentation.'
        })
          .then(() => {})
          .catch(() => {})
          .finally(() => {
            put(resetPresentation());
          })
      );
    }
  } catch (e) {
    // We don't know which step is failed thus we set the same error for both
    yield* put(setPostDefinitionError({ error: serializeError(e) }));
    yield* put(setPreDefinitionError({ error: serializeError(e) }));
  }
}

/**
 * Helper method to send a DCQL response
 */

function* onPresentCredentialIdentified(
  toProcess: EvaluateDcqlReturn,
  requestObject: Awaited<
    ReturnType<Credential.Presentation.VerifyRequestObject>
  >['requestObject']
) {
  const credentialsToPresent = toProcess.map(
    ({ requiredDisclosures, ...rest }) => ({
      ...rest,
      requestedClaims: requiredDisclosures.map(([, claimName]) => claimName)
    })
  );

  const { rpConf } = yield* call(
    Credential.Presentation.evaluateRelyingPartyTrust,
    requestObject.client_id
  );

  const remotePresentations = yield* call(
    Credential.Presentation.prepareRemotePresentations,
    credentialsToPresent,
    requestObject.nonce,
    requestObject.client_id
  );

  const authResponse = yield* call(
    Credential.Presentation.sendAuthorizationResponse,
    requestObject,
    remotePresentations,
    rpConf
  );

  yield* put(setPostDefinitionSuccess(authResponse));
}

/**
 * This helper function handles the case in which the wallet owner could not be authenticated during a presentation
 */
function* onPresentCredentialUnidentified() {
  throw new Error('Identification failed');
}
