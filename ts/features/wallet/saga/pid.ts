import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import Config from 'react-native-config';
import {call, put, takeLatest} from 'typed-redux-saga';
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
import {wellKnownCredential} from '../utils/credentials';
import {startSequentializedIdentificationProcess} from '../../../utils/identification';
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
      credentialType: wellKnownCredential.PID
    });

    const {issuerUrl, credentialType} = startFlow();

    // Evaluate issuer trust
    const {issuerConf} = yield* call(
      Credential.Issuance.getIssuerConfig,
      issuerUrl
    );

    // Start user authorization
    const {issuerRequestUri, clientId, codeVerifier, credentialDefinition} =
      yield* call(
        Credential.Issuance.startUserAuthorization,
        issuerConf,
        credentialType,
        {
          walletInstanceAttestation,
          redirectUri,
          wiaCryptoContext
        }
      );

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

    const {credential, format} = yield* call(
      Credential.Issuance.obtainCredential,
      issuerConf,
      accessToken,
      clientId,
      credentialDefinition,
      {
        credentialCryptoContext,
        dPopCryptoContext
      }
    );

    const {parsedCredential} = yield* call(
      Credential.Issuance.verifyAndParseCredential,
      issuerConf,
      credential,
      format,
      wellKnownCredential.PID,
      {credentialCryptoContext}
    );

    yield* put(
      setPidIssuanceSuccess({
        credential: {
          parsedCredential,
          credential,
          credentialType,
          keyTag: credentialKeyTag,
          format
        }
      })
    );
  } catch (error) {
    yield* put(setPidIssuanceError({error: serializeError(error)}));
  }
}

/**
 * Saga to store the PID credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the PID is stored and the lifecycle is set to `LIFECYCLE_VALID`.
 */
function* storePidWithIdentification(
  action: ReturnType<typeof addPidWithIdentification>
) {
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
    function* () {
      yield* put(addCredential({credential: action.payload.credential}));
      yield* put(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_VALID}));
      navigate('MAIN_WALLET_NAV', {screen: 'PID_ISSUANCE_SUCCESS'});
    },
    function* () {
      return;
    }
  );
}
