import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import Config from 'react-native-config';
import {call, put, select, takeLatest} from 'typed-redux-saga';
import uuid from 'react-native-uuid';
import {generate} from '@pagopa/io-react-native-crypto';
import {serializeError} from 'serialize-error';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
import {
  setPidIssuanceError,
  setPidIssuanceRequest,
  setPidIssuanceSuccess
} from '../store/pidIssuance';
import {Lifecycle, setLifecycle} from '../store/lifecycle';
import {navigate} from '../../../navigation/utils';
import {addCredential, addPidWithIdentification} from '../store/credentials';
import {wellKnownCredentialConfigurationIDs} from '../utils/credentials';
import {
  IdentificationResultTask,
  startSequentializedIdentificationProcess
} from '../../../saga/identification';
import {createWalletProviderFetch} from '../utils/fetch';
import {selectSessionId} from '../../../store/reducers/preferences';
import {getAttestation} from './attestation';

/**
 * Saga watcher for PID related actions.
 */
export function* watchPidSaga() {
  yield* takeLatest(setPidIssuanceRequest, obtainPid);
  yield* takeLatest(addPidWithIdentification, storePidWithIdentification);
}

/**
 * Saga to obtain the PID credential. It contains the whole issuance flow for a PID, including
 * the strong authentication with `@pagopa/io-react-native-login-utils`.
 * The result is a credential ready to be stored.
 */
function* obtainPid() {
  try {
    const {PID_PROVIDER_BASE_URL, PID_REDIRECT_URI: redirectUri} = Config;

    // Get the wallet instance attestation and generate its crypto context
    const walletInstanceAttestation = yield* call(getAttestation);
    const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

    // Start the issuance flow
    const startFlow: Credential.Issuance.StartFlow = () => ({
      issuerUrl: PID_PROVIDER_BASE_URL,
      credentialId: wellKnownCredentialConfigurationIDs.PID
    });

    const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
    const sessionId = yield* select(selectSessionId);
    const appFetch = createWalletProviderFetch(
      walletProviderBaseUrl,
      sessionId
    );

    const {issuerUrl, credentialId: credentialConfigId} = startFlow();

    // Evaluate issuer trust
    const {issuerConf} = yield* call(
      Credential.Issuance.evaluateIssuerTrust,
      issuerUrl,
      {appFetch}
    );

    // Start user authorization
    const {issuerRequestUri, clientId, codeVerifier, credentialDefinition} =
      yield* call(
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

    // Obtain the Authorization URL
    const {authUrl} = yield* call(
      Credential.Issuance.buildAuthorizationUrl,
      issuerRequestUri,
      clientId,
      issuerConf
    );

    const supportsCustomTabs = yield* call(supportsInAppBrowser);
    if (!supportsCustomTabs) {
      throw new Error('Custom tabs are not supported');
    }

    const baseRedirectUri = new URL(redirectUri).protocol.replace(':', '');

    // Open the authorization URL in the custom tab
    const authRedirectUrl = yield* call(
      openAuthenticationSession,
      authUrl,
      baseRedirectUri
    );

    const {code} = yield* call(
      Credential.Issuance.completeUserAuthorizationWithQueryMode,
      authRedirectUrl
    );

    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    yield* call(generate, credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

    // Create DPoP context for the whole issuance flow
    yield* call(regenerateCryptoKey, DPOP_KEYTAG);
    const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

    const {accessToken} = yield* call(
      Credential.Issuance.authorizeAccess,
      issuerConf,
      code,
      clientId,
      redirectUri,
      codeVerifier,
      {
        walletInstanceAttestation,
        wiaCryptoContext,
        dPopCryptoContext
      }
    );

    // For simplicity, in this example flow we work on a single credential.
    const {credential_configuration_id, credential_identifiers} =
      accessToken.authorization_details[0]!;

    const {credential, format} = yield* call(
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

    const {parsedCredential} = yield* call(
      Credential.Issuance.verifyAndParseCredential,
      issuerConf,
      credential,
      credential_configuration_id,
      {credentialCryptoContext}
    );

    yield* put(
      setPidIssuanceSuccess({
        credential: {
          parsedCredential,
          credential,
          credentialType,
          keyTag: credentialKeyTag,
          format: format as 'vc+sd-jwt' | 'mso_mdoc'
        }
      })
    );
  } catch (error) {
    yield* put(setPidIssuanceError({error: serializeError(error)}));
  }
}

/**
 * Helper function to process the identified case of the {@link storePidWithIdentification} method
 * @param action the action with which {@link storePidWithIdentification} is invoked
 */
function* onStorePidIdentified(
  action: ReturnType<typeof addPidWithIdentification>
) {
  yield* put(addCredential({credential: action.payload.credential}));
  yield* put(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_VALID}));
  navigate('MAIN_WALLET_NAV', {screen: 'PID_ISSUANCE_SUCCESS'});
}

/**
 * Helper function to process the unidentified case of the {@link storePidWithIdentification} method
 */
function* onStorePidUnidentified() {
  return;
}

/**
 * Saga to store the PID credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the PID is stored and the lifecycle is set to `LIFECYCLE_VALID`.
 */
function* storePidWithIdentification(
  action: ReturnType<typeof addPidWithIdentification>
) {
  const onIdentifiedTask: IdentificationResultTask<
    (arg0: typeof action) => Generator
  > = {
    fn: onStorePidIdentified,
    args: [action]
  };

  const onUnidentifiedTask: IdentificationResultTask<() => Generator> = {
    fn: onStorePidUnidentified,
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
