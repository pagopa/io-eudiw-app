import { CryptoContext } from '@pagopa/io-react-native-jwt';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import { serializeError } from 'serialize-error';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../middleware/listener';
import { takeLatestEffect } from '../../../middleware/listener/effects';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import { CredentialTypePresentationClaimsListDescriptor } from '../components/presentation/CredentialTypePresentationClaimsList';
import { selectCredentials } from '../store/credentials';
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
import { CredentialTypePresentationClaimsListDescriptor } from '../components/presentation/CredentialTypePresentationClaimsList';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../middleware/listener/types';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import { takeLatestEffect } from '../../../middleware/listener/effects';
import { ParsedCredential } from '../utils/itwTypesUtils';

type DcqlQuery = Parameters<Credential.Presentation.EvaluateDcqlQuery>[1];

type RequiredDisclosure = [string, string, unknown];

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
    const { request_uri, client_id, state, request_uri_method } =
      action.payload;

    const qrParameters = Credential.Presentation.startFlowFromQR({
      request_uri,
      client_id,
      state,
      request_uri_method
    });

    const { requestObjectEncodedJwt } =
      await Credential.Presentation.getRequestObject(qrParameters.request_uri);

    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(
        qrParameters.client_id
      );

    const { requestObject } = await Credential.Presentation.verifyRequestObject(
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId: qrParameters.client_id,
        rpSubject: subject,
        state: qrParameters.state
      }
    );

    const credentials = selectCredentials(listenerApi.getState());

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

    const evaluateDcqlQuery = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    const sdJwtCredentials = credentials.filter(
      credential =>
        credential.format === 'dc+sd-jwt' || credential.format === 'vc+sd-jwt'
    );

    listenerApi.dispatch(
      setPreDefinitionSuccess(
        evaluateDcqlQuery
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
          .reduce((acc, curr) => ({ ...acc, ...curr }), {})
      )
    );

    /* Wait for the user to confirm the presentation with the claims or to cancel it
     *  - In case the user confirms the presentation, the payload will contain a list of the name of optionals claims to be presented
     *  - In case the user cancels the presentation, no payload will be needed
     */
    const choice = await listenerApi.take(
      isAnyOf(setPostDefinitionRequest, setPostDefinitionCancel)
    );

    if (setPostDefinitionRequest.match(choice[0])) {
      listenerApi.dispatch(
        setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
      );
      const resAction = await listenerApi.take(
        isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
      );
      if (setIdentificationIdentified.match(resAction[0])) {
        const credentialsToPresent = evaluateDcqlQuery.map(
          ({ requiredDisclosures, ...rest }) => ({
            ...rest,
            requestedClaims: requiredDisclosures.map(
              ([, claimName]) => claimName
            )
          })
        );

        const remotePresentations =
          await Credential.Presentation.prepareRemotePresentations(
            credentialsToPresent,
            requestObject.nonce,
            requestObject.client_id
          );

        const authResponse =
          await Credential.Presentation.sendAuthorizationResponse(
            requestObject,
            remotePresentations,
            rpConf
          );
        listenerApi.dispatch(setPostDefinitionSuccess(authResponse));
      } else {
        throw new Error('Identification failed');
      }
    } else {
      // The result of this call is ignored for the user is not interested in any message
      Credential.Presentation.sendAuthorizationErrorResponse(requestObject, {
        error: 'access_denied',
        errorDescription: 'The user cancelled the presentation.'
      })
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          listenerApi.dispatch(resetPresentation());
        });
    }
  } catch (error) {
    if (error instanceof TaskAbortError) {
      return;
    }
    // We don't know which step is failed thus we set the same error for both
    const serializableError = JSON.stringify(error);
    listenerApi.dispatch(
      setPostDefinitionError({ error: serializeError(serializableError) })
    );
    listenerApi.dispatch(
      setPreDefinitionError({ error: serializeError(serializableError) })
    );
  }
};

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

export const addPresentationListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: setPreDefinitionRequest,
    effect: takeLatestEffect(presentationListener)
  });
};
