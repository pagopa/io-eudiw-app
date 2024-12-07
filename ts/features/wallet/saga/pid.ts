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
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
import {selectAttestation} from '../store/attestation';
import {
  setPidIssuanceError,
  setPidIssuanceRequest,
  setPidIssuanceSuccess
} from '../store/pidIssuance';

export function* watchPidSaga() {
  yield* takeLatest(setPidIssuanceRequest, obtainPid);
}

function* obtainPid() {
  try {
    const {
      PID_PROVIDER_BASE_URL,
      PID_REDIRECT_URI: redirectUri,
      PID_IDP_HINT: idpHint
    } = Config;

    const walletInstanceAttestation = yield* select(selectAttestation);

    if (!walletInstanceAttestation) {
      throw new Error('Wallet instance attestation not found');
    }

    const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

    // Start the issuance flow
    const startFlow: Credential.Issuance.StartFlow = () => ({
      issuerUrl: PID_PROVIDER_BASE_URL,
      credentialType: 'PersonIdentificationData'
    });

    const {issuerUrl, credentialType} = startFlow();

    // Evaluate issuer trust
    const {issuerConf} = yield* call(
      Credential.Issuance.evaluateIssuerTrust,
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
      issuerConf,
      idpHint
    );

    const supportsCustomTabs = yield* call(supportsInAppBrowser);
    if (!supportsCustomTabs) {
      throw new Error('Custom tabs are not supported');
    }

    const baseRedirectUri = new URL('eudiwpid://cb').protocol.replace(':', '');

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
      {credentialCryptoContext}
    );

    yield* put(
      setPidIssuanceSuccess({
        credential: {
          parsedCredential,
          credential,
          credentialType,
          keyTag: credentialKeyTag
        }
      })
    );
  } catch (error) {
    console.log(error);
    console.log(JSON.stringify(error));
    yield* put(setPidIssuanceError({error: JSON.stringify(error)}));
  }
}
