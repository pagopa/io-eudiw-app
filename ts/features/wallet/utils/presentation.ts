import { Credential } from '@pagopa/io-react-native-wallet';
import { call, put } from 'typed-redux-saga';
import {
  AuthResponse,
  OptionalClaims,
  setPreDefinitionSuccess
} from '../store/presentation';

type DcqlQuery = Parameters<Credential.Presentation.EvaluateDcqlQuery>[0];
export type RequestObject = Awaited<
  ReturnType<Credential.Presentation.VerifyRequestObjectSignature>
>['requestObject'];
export type JWK = Awaited<
  ReturnType<typeof Credential.Presentation.fetchJwksFromRequestObject>
>['keys'][0];

/**
 * This generator function must parse the {@link RequestObject}, extract the disclosures
 * and {@link put} them in an action that drives the router to a proper selection screen.
 * @param requestObject : The RP presented {@link RequestObject}
 * @param credentialsSdJwt : An array of string triples representing, in order,
 *                           the credential type, the credential claim key and the corresponding value
 * @param credentialsMdoc  : An array of string triples representing, in order,
 *                           the credential type, the credential claim key and the corresponding value
 * @returns A {@link Generator} that, after progressing the Presentation saga, returns an object describing which
 * disclosures to share with the RP to be processed by a compatible {@link PresentationResponseProcessor}
 */
export type PresentationRequestProcessor<T> = (
  requestObject: RequestObject,
  credentialsSdJwt: Array<[string, string, string]>,
  credentialsMdoc: Array<[string, string, string]>
) => Generator<unknown, T, any>;

/**
 * This generator function handles the generation of the proper {@link AuthResponse} to send
 * to the RP by combining the required disclosures parsed by the {@link PresentationRequestProcessor}
 * and the optional disclosures chosen by the user.
 * @param toProcess : The return value of a corresponding {@link PresentationRequestProcessor} invocation
 * @param requestObject : The RP presented {@link RequestObject}
 * @param optionalClaims : The array of optional disclosures chosen by the user
 * @param jwks : An Array of {@link JWK}s used to create the {@link AuthResponse}
 * @returns A {@link Generator} that creates the Presentation response for the RP and returns its {@link AuthResponse}
 */
export type PresentationResponseProcessor<T> = (
  toProcess: T,
  requestObject: RequestObject,
  optionalClaims: Array<OptionalClaims>,
  jwks: Array<JWK>
) => Generator<unknown, AuthResponse, any>;

type EvaluateDcqlReturn = Awaited<
  ReturnType<typeof Credential.Presentation.evaluateDcqlQuery>
>;
type EvaluatePresentationDefinitionReturn = {
  inputDescriptors: Awaited<
    ReturnType<typeof Credential.Presentation.evaluateInputDescriptors>
  >;
  presentationDefinitionId: string;
};

/**
 * Helper method to parse a DCQL request
 */
export const handleDcqlRequest: PresentationRequestProcessor<EvaluateDcqlReturn> =
  function* (
    requestObject: RequestObject,
    credentialsSdJwt: Array<[string, string, string]>,
    credentialsMdoc: Array<[string, string, string]>
  ) {
    const evaluateDcqlQuery = yield* call(
      Credential.Presentation.evaluateDcqlQuery,
      requestObject.dcql_query as DcqlQuery,
      credentialsSdJwt,
      credentialsMdoc
    );

    yield* put(
      setPreDefinitionSuccess(
        evaluateDcqlQuery.map(query => ({
          requiredDisclosures: query.requiredDisclosures,
          optionalDisclosures: []
        }))
      )
    );

    return evaluateDcqlQuery;
  };

/**
 * Helper method to send a DCQL response
 */
export const handleDcqlResponse: PresentationResponseProcessor<EvaluateDcqlReturn> =
  function* (
    toProcess: EvaluateDcqlReturn,
    requestObject: RequestObject,
    _: Array<OptionalClaims>,
    jwks: Array<JWK>
  ) {
    const credentialsToPresent = toProcess.map(
      ({ requiredDisclosures, ...rest }) => ({
        ...rest,
        credentialInputId: rest.id,
        requestedClaims: requiredDisclosures
      })
    );

    const authRequestObject = {
      nonce: requestObject.nonce,
      clientId: requestObject.client_id,
      responseUri: requestObject.response_uri
    };

    const remotePresentations = yield* call(
      Credential.Presentation.prepareRemotePresentations,
      credentialsToPresent,
      authRequestObject
    );

    return yield* call(
      Credential.Presentation.sendAuthorizationResponseDcql,
      requestObject,
      jwks,
      remotePresentations
    );
  };

/**
 * Helper method to prepare and a presentation definition request
 */
export const handlePresentationDefinitionRequest: PresentationRequestProcessor<EvaluatePresentationDefinitionReturn> =
  function* (
    requestObject: RequestObject,
    credentialsSdJwt: Array<[string, string, string]>,
    credentialsMdoc: Array<[string, string, string]>
  ) {
    const { presentationDefinition } = yield* call(
      Credential.Presentation.fetchPresentDefinition,
      requestObject
    );

    const evaluateInputDescriptors = yield* call(
      Credential.Presentation.evaluateInputDescriptors,
      presentationDefinition.input_descriptors,
      credentialsSdJwt,
      credentialsMdoc
    );

    yield* put(
      setPreDefinitionSuccess(
        evaluateInputDescriptors.map(
          descriptor => descriptor.evaluatedDisclosure
        )
      )
    );

    return {
      inputDescriptors: evaluateInputDescriptors,
      presentationDefinitionId: presentationDefinition.id
    };
  };

/**
 * Helper method to send a DCQL response
 */
export const handlePresentationDefinitionResponse: PresentationResponseProcessor<EvaluatePresentationDefinitionReturn> =
  function* (
    toProcess: EvaluatePresentationDefinitionReturn,
    requestObject: RequestObject,
    optionalClaims: Array<OptionalClaims>,
    jwks: Array<JWK>
  ) {
    const credentialAndInputDescriptor = toProcess.inputDescriptors.map(
      evaluateInputDescriptor => {
        // Present only the mandatory claims
        const format = Object.keys(
          evaluateInputDescriptor.inputDescriptor.format || {}
        )[0]! as 'mso_mdoc' | 'vc+sd-jwt';

        const requestedClaims = [
          ...evaluateInputDescriptor.evaluatedDisclosure.requiredDisclosures,
          ...optionalClaims
        ];

        return format === 'mso_mdoc'
          ? {
              requestedClaims,
              credentialInputId: evaluateInputDescriptor.inputDescriptor.id,
              credential: evaluateInputDescriptor.credential,
              keyTag: evaluateInputDescriptor.keyTag,
              format,
              doctype: evaluateInputDescriptor.inputDescriptor.id
            }
          : {
              requestedClaims,
              credentialInputId: evaluateInputDescriptor.inputDescriptor.id,
              credential: evaluateInputDescriptor.credential,
              keyTag: evaluateInputDescriptor.keyTag,
              format
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

    return yield* call(
      Credential.Presentation.sendAuthorizationResponse,
      requestObject,
      toProcess.presentationDefinitionId,
      jwks,
      remotePresentations
    );
  };
