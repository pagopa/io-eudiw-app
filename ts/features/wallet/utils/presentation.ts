import {Credential} from '@pagopa/io-react-native-wallet';
import {call, put, select} from 'typed-redux-saga';
import {CryptoContext} from '@pagopa/io-react-native-jwt';
import {
  AuthResponse,
  OptionalClaims,
  setPreDefinitionSuccess
} from '../store/presentation';
import {selectCredentials} from '../store/credentials';
import {ParsedCredential} from './types';
import {wellKnownCredential} from './credentials';

type DcqlQuery = Parameters<Credential.Presentation.EvaluateDcqlQuery>[1];
export type RequestObject = Awaited<
  ReturnType<Credential.Presentation.VerifyRequestObject>
>['requestObject'];

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
  credentialsSdJwt: Array<[CryptoContext, string]>
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
  optionalClaims: Array<OptionalClaims>
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
type RequiredDisclosure = [string, string, unknown];

export interface PIDField {
  id: string;
  value: unknown;
  name: Record<string, string>;
}

export interface PIDObject {
  [pidType: string]: {
    claims: Record<string, PIDField>;
  };
}

/**
 * Helper method to parse a DCQL request
 */
export function transformDescriptorObject(
  requiredDisclosures: Array<RequiredDisclosure>,
  parsedCredential: ParsedCredential
): PIDObject {
  const claims: Record<string, PIDField> = {};

  for (const [id, claimName] of requiredDisclosures) {
    const parsed = parsedCredential[claimName];

    if (!parsed) {
      console.warn(`Missing parsed data for claim: ${claimName}`);
      continue;
    }
    // eslint-disable-next-line functional/no-let
    let name: Record<string, string> = {};

    if (typeof parsed.name === 'string') {
      name = {en: parsed.name};
    } else if (parsed.name && typeof parsed.name === 'object') {
      name = parsed.name;
    }

    // eslint-disable-next-line functional/immutable-data
    claims[claimName] = {
      id,
      value: parsed.value,
      name
    };
  }

  return {
    [wellKnownCredential.PID]: {
      claims
    }
  };
}

export const handleDcqlRequest: PresentationRequestProcessor<EvaluateDcqlReturn> =
  function* (
    requestObject: RequestObject,
    credentialsSdJwt: Array<[CryptoContext, string]>
  ) {
    const credentialsTransformedSdJwt: Array<[CryptoContext, string]> =
      credentialsSdJwt.map(item => [item[0], item[1]]);

    const evaluateDcqlQuery = yield* call(
      Credential.Presentation.evaluateDcqlQuery,
      credentialsTransformedSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    const allCredentials = yield* select(selectCredentials);
    const sdJwtCredential = allCredentials.filter(
      credential =>
        credential.format === 'dc+sd-jwt' || credential.format === 'vc+sd-jwt'
    );

    yield* put(
      setPreDefinitionSuccess(
        evaluateDcqlQuery.map(query => ({
          requiredDisclosures: transformDescriptorObject(
            query.requiredDisclosures,
            sdJwtCredential[0]?.parsedCredential
          ),
          optionalDisclosures: [],
          unrequestedDisclosures: []
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
    _: Array<OptionalClaims>
  ) {
    const credentialsToPresent = toProcess.map(
      ({requiredDisclosures, ...rest}) => ({
        ...rest,
        requestedClaims: requiredDisclosures.map(([, claimName]) => claimName)
      })
    );

    const {rpConf} = yield* call(
      Credential.Presentation.evaluateRelyingPartyTrust,
      requestObject.client_id
    );

    const remotePresentations = yield* call(
      Credential.Presentation.prepareRemotePresentations,
      credentialsToPresent,
      requestObject.nonce,
      requestObject.client_id
    );

    return yield* call(
      Credential.Presentation.sendAuthorizationResponse,
      requestObject,
      remotePresentations,
      rpConf
    );
  };

/**
 * Helper method to prepare and a presentation definition request
 */
export const handlePresentationDefinitionRequest: PresentationRequestProcessor<EvaluatePresentationDefinitionReturn> =
  function* (
    requestObject: RequestObject,
    credentialsSdJwt: Array<[CryptoContext, string]>
  ) {
    const {presentationDefinition} = yield* call(
      Credential.Presentation.fetchPresentDefinition,
      requestObject
    );

    const testJwt: Array<[CryptoContext, string]> = credentialsSdJwt.map(
      item => [item[0], item[1]]
    );

    const evaluateInputDescriptors = yield* call(
      Credential.Presentation.evaluateInputDescriptors,
      presentationDefinition.input_descriptors,
      testJwt
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
    optionalClaims: Array<OptionalClaims>
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
              format,
              doctype: evaluateInputDescriptor.inputDescriptor.id,
              cryptoContext: evaluateInputDescriptor.cryptoContext
            }
          : {
              requestedClaims,
              credentialInputId: evaluateInputDescriptor.inputDescriptor.id,
              credential: evaluateInputDescriptor.credential,
              format,
              cryptoContext: evaluateInputDescriptor.cryptoContext
            };
      }
    );

    const {rpConf} = yield* call(
      Credential.Presentation.evaluateRelyingPartyTrust,
      requestObject.client_id
    );

    const credentialsToPresent = credentialAndInputDescriptor.map(item => ({
      id: item.credentialInputId,
      credential: item.credential,
      cryptoContext: item.cryptoContext,
      requestedClaims: item.requestedClaims.map(rc => rc.encoded)
    }));

    const remotePresentations = yield* call(
      Credential.Presentation.prepareRemotePresentations,
      credentialsToPresent,
      requestObject.nonce,
      requestObject.client_id
    );

    return yield* call(
      Credential.Presentation.sendAuthorizationResponse,
      requestObject,
      remotePresentations,
      rpConf
    );
  };
