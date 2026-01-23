import { IOToast } from '@pagopa/io-app-design-system';
import { generate } from '@pagopa/io-react-native-crypto';
import { CryptoContext } from '@pagopa/io-react-native-jwt';
import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import {
  EvaluateIssuerTrust,
  StartUserAuthorization
} from '@pagopa/io-react-native-wallet/lib/typescript/credential/issuance';
import { Out } from '@pagopa/io-react-native-wallet/lib/typescript/utils/misc';
import i18next from 'i18next';
import uuid from 'react-native-uuid';
import { call, put, race, select, take, takeLatest } from 'typed-redux-saga';
import { getEnv } from '../../../../ts/config/env';
import { navigateWithReset } from '../../../navigation/utils';
import {
  IdentificationResultTask,
  startSequentializedIdentificationProcess
} from '../../../saga/identification';
import { selectSessionId } from '../../../store/reducers/preferences';
import { regenerateCryptoKey } from '../../../utils/crypto';
import {
  resetCredentialIssuance,
  selectRequestedCredential,
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthRequest,
  setCredentialIssuancePostAuthSuccess,
  setCredentialIssuancePreAuthError,
  setCredentialIssuancePreAuthRequest,
  setCredentialIssuancePreAuthSuccess
} from '../store/credentialIssuance';
import {
  addCredential,
  addCredentialWithIdentification,
  selectCredential
} from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';
import { DPOP_KEYTAG, WIA_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { StoredCredential } from '../utils/itwTypesUtils';
import { getAttestation } from './attestation';

/**
 * Saga watcher for credential related actions.
 */
export function* watchCredentialSaga() {
  yield* takeLatest([setCredentialIssuancePreAuthRequest], function* (...args) {
    yield* race({
      task: call(obtainCredential, ...args),
      cancel: take(resetCredentialIssuance)
    });
  });
  yield* takeLatest(
    addCredentialWithIdentification,
    storeCredentialWithIdentification
  );
}

/**
 * Helper to obtain the authorization code based on the credential type.
 * Handles the distinction between API-based issuance (Disability Card)
 * and browser-based issuance (all the other credentials).
 */
function* getCredentialAuthCode(params: {
  credentialType: string;
  pid: StoredCredential | undefined;
  issuerRequestUri: string;
  clientId: Out<StartUserAuthorization>['clientId'];
  issuerConf: Out<EvaluateIssuerTrust>['issuerConf'];
  appFetch: GlobalFetch['fetch'];
  wiaCryptoContext: CryptoContext;
  redirectUri: string;
  authUrl: string;
}) {
  const {
    credentialType,
    pid,
    issuerRequestUri,
    clientId,
    issuerConf,
    appFetch,
    wiaCryptoContext,
    redirectUri,
    authUrl
  } = params;

  if (credentialType === wellKnownCredential.DISABILITY_CARD) {
    if (!pid || !pid.credential || !pid.keyTag) {
      throw new Error('PID required for disability card issuance but missing.');
    }

    const requestObject = yield* call(
      Credential.Issuance.getRequestedCredentialToBePresented,
      issuerRequestUri,
      clientId,
      issuerConf,
      appFetch
    );

    const { code } = yield* call(
      Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode,
      requestObject,
      pid.credential,
      issuerConf,
      {
        wiaCryptoContext,
        pidCryptoContext: createCryptoContextFor(pid.keyTag),
        appFetch
      }
    );

    return code;
  } else {
    const baseRedirectUri = new URL(redirectUri).protocol.replace(':', '');

    // Open the authorization URL in the custom tab
    const authRedirectUrl = yield* call(
      openAuthenticationSession,
      authUrl,
      baseRedirectUri
    );

    const { code } = yield* call(
      Credential.Issuance.completeUserAuthorizationWithQueryMode,
      authRedirectUrl
    );

    return code;
  }
}

/**
 * Function which handles the issuance of a credential.
 * The related state is divided in two parts, pre and post authorization.
 * Pre authorization is the phase before the user is asked to authorize the presentation of the required credentials and claims to the issuer.
 * Post authorization is the phase after the user has authorized the presentation of the required credentials and claims to the issuer.
 * Currently the flow is not complete and thus the authorization is mocked and asks for the whole PID.
 */
function* obtainCredential() {
  try {
    const {
      EXPO_PUBLIC_EAA_PROVIDER_BASE_URL,
      EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri,
      EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl
    } = getEnv();

    /**
     * Check the passed credential type and throw an error if it's not found.
     */
    const credentialConfigId = yield* select(selectRequestedCredential);
    if (!credentialConfigId) {
      throw new Error('Credential type not found');
    }

    // Get the wallet instance attestation and generate its crypto context
    const walletInstanceAttestation = yield* call(getAttestation);

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    yield* call(generate, credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);
    const sessionId = yield* select(selectSessionId);
    const pid = yield* select(selectCredential(wellKnownCredential.PID));
    const appFetch = createWalletProviderFetch(
      walletProviderBaseUrl,
      sessionId
    );

    // Start the issuance flow
    const startFlow: Credential.Issuance.StartFlow = () => ({
      issuerUrl: EXPO_PUBLIC_EAA_PROVIDER_BASE_URL,
      credentialId: credentialConfigId
    });

    const { issuerUrl } = startFlow();

    // Evaluate issuer trust
    const { issuerConf } = yield* call(
      Credential.Issuance.evaluateIssuerTrust,
      issuerUrl
    );

    // Start user authorization
    const { issuerRequestUri, clientId, codeVerifier } = yield* call(
      Credential.Issuance.startUserAuthorization,
      issuerConf,
      [credentialConfigId],
      {
        walletInstanceAttestation,
        redirectUri,
        wiaCryptoContext,
        appFetch
      }
    );

    // Extract the credential type from the config
    const credentialConfig =
      issuerConf.openid_credential_issuer.credential_configurations_supported[
        credentialConfigId
      ];
    const credentialType =
      credentialConfig.format === 'mso_mdoc'
        ? credentialConfig.scope
        : credentialConfig.vct;

    if (!credentialType) {
      throw new Error(
        `Error: The selected credential config doesn't have a credentialType`
      );
    }

    yield* put(
      setCredentialIssuancePreAuthSuccess({
        result: true,
        credentialType
      })
    );
    yield* take(setCredentialIssuancePostAuthRequest);

    // Obtain the Authorization URL
    const { authUrl } = yield* call(
      Credential.Issuance.buildAuthorizationUrl,
      issuerRequestUri,
      clientId,
      issuerConf
    );

    const supportsCustomTabs = yield* call(supportsInAppBrowser);
    if (!supportsCustomTabs) {
      throw new Error('Custom tabs are not supported');
    }
    /* End of temporary block code */

    const credentialCode = yield* call(getCredentialAuthCode, {
      credentialType,
      pid,
      issuerRequestUri,
      clientId,
      issuerConf,
      appFetch,
      wiaCryptoContext,
      redirectUri,
      authUrl
    });

    // Generate the DPoP context which will be used for the whole issuance flow
    yield* call(regenerateCryptoKey, DPOP_KEYTAG);
    const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

    const { accessToken } = yield* call(
      Credential.Issuance.authorizeAccess,
      issuerConf,
      credentialCode,
      clientId,
      redirectUri,
      codeVerifier,
      {
        walletInstanceAttestation,
        wiaCryptoContext,
        dPopCryptoContext
      }
    );

    // Obtain the credential
    // # TODO: WLEO-727 - rework to support multiple credentials issuance
    const { credential_configuration_id, credential_identifiers } =
      accessToken.authorization_details[0];

    const { credential, format } = yield* call(
      Credential.Issuance.obtainCredential,
      issuerConf,
      accessToken,
      clientId,
      {
        credential_configuration_id,
        credential_identifier: credential_identifiers[0]
      },
      {
        credentialCryptoContext,
        dPopCryptoContext,
        appFetch
      }
    );

    // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
    const { parsedCredential, expiration, issuedAt } = yield* call(
      Credential.Issuance.verifyAndParseCredential,
      issuerConf,
      credential,
      credential_configuration_id,
      {
        credentialCryptoContext,
        ignoreMissingAttributes: true
      }
      // 'x509CertRoot'
    );

    yield* put(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          parsedCredential,
          credentialType,
          keyTag: credentialKeyTag,
          format: format as 'vc+sd-jwt' | 'mso_mdoc',
          expiration: expiration.toISOString(),
          issuedAt: issuedAt?.toISOString(),
          issuerConf
        }
      })
    );
  } catch (error) {
    // We put the error in both the pre and post auth status as we are unsure where the error occurred.
    const serializableError = JSON.stringify(error);
    yield* put(
      setCredentialIssuancePostAuthError({ error: serializableError })
    );
    yield* put(setCredentialIssuancePreAuthError({ error: serializableError }));
  }
}

/**
 * Helper function to process the identified case of the {@link storeCredentialWithIdentification} method
 * @param action the action with which {@link storeCredentialWithIdentification} is invoked
 */
function* onStoreCredentialIdentified(
  action: ReturnType<typeof addCredentialWithIdentification>
) {
  yield* put(addCredential({ credential: action.payload.credential }));
  yield* put(resetCredentialIssuance());
  navigateWithReset('MAIN_TAB_NAV');
  IOToast.success(i18next.t('buttons.done', { ns: 'global' }));
}

/**
 * Helper function to process the unidentified case of the {@link storeCredentialWithIdentification} method
 */
function* onStoreCredentialUnidentified() {
  return;
}

/**
 * Saga to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
function* storeCredentialWithIdentification(
  action: ReturnType<typeof addCredentialWithIdentification>
) {
  const onIdentifiedTask: IdentificationResultTask<
    typeof onStoreCredentialIdentified
  > = {
    fn: onStoreCredentialIdentified,
    args: [action]
  };

  const onUnidentifiedTask: IdentificationResultTask<
    typeof onStoreCredentialUnidentified
  > = {
    fn: onStoreCredentialUnidentified,
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
}
