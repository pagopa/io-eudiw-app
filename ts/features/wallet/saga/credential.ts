import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import Config from 'react-native-config';
import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
import uuid from 'react-native-uuid';
import {generate} from '@pagopa/io-react-native-crypto';
import {IOToast} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
import {selectAttestation} from '../store/attestation';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import {Lifecycle, setLifecycle} from '../store/lifecycle';
import {navigate} from '../../../navigation/utils';
import {
  addCredential,
  addCredentialWithIdentification,
  selectCredential
} from '../store/credentials';
import {wellKnownCredential} from '../utils/credentials';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthRequest,
  setCredentialIssuancePostAuthSuccess,
  setCredentialIssuancePreAuthError,
  setCredentialIssuancePreAuthRequest,
  setCredentialIssuancePreAuthSuccess
} from '../store/credentialIssuance';

/**
 * Saga watcher for PID related actions.
 */
export function* watchCredentialSaga() {
  yield* takeLatest([setCredentialIssuancePreAuthRequest], function* (...args) {
    yield* race({
      task: call(obtainCredentialPreAuth, ...args),
      cancel: take(resetCredentialIssuance)
    });
  });
  yield* takeLatest(
    [setCredentialIssuancePostAuthRequest],
    function* (...args) {
      yield* race({
        task: call(obtainCredentialPostAuth, ...args),
        cancel: take(resetCredentialIssuance)
      });
    }
  );
  yield* takeLatest(
    addCredentialWithIdentification,
    storePidWithIdentification
  );
}

function* obtainCredentialPreAuth() {
  try {
    const {EAA_PROVIDER_BASE_URL, PID_REDIRECT_URI: redirectUri} = Config;

    /**
     * Check the passed credential type and throw an error if it's not found.
     */
    const credentialType = yield* select(selectRequestedCredential);
    if (!credentialType) {
      throw new Error('Credential type not found');
    }

    /**
     * Get the wallet instance attestation from the store and throw an error if it's not found.
     * Also generate its cryptocontext.
     */
    const walletInstanceAttestation = yield* select(selectAttestation);
    if (!walletInstanceAttestation) {
      throw new Error('Wallet instance attestation not found');
    }
    const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

    // Start the issuance flow
    const startFlow: Credential.Issuance.StartFlow = () => ({
      issuerUrl: EAA_PROVIDER_BASE_URL,
      credentialType
    });

    const {issuerUrl} = startFlow();

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

    const requestObject = yield* call(
      Credential.Issuance.getRequestedCredentialToBePresented,
      issuerRequestUri,
      clientId,
      issuerConf
    );
    yield* put(
      setCredentialIssuancePreAuthSuccess({
        result: {
          requestObject,
          codeVerifier,
          credentialDefinition,
          clientId,
          redirectUri,
          credentialType,
          issuerConf
        }
      })
    );
  } catch (error) {
    yield* put(
      setCredentialIssuancePreAuthError({error: JSON.stringify(error)})
    );
  }
}

function* obtainCredentialPostAuth() {
  try {
    const preAuthResult = yield* select(selectCredentialIssuancePreAuthStatus);
    if (!preAuthResult.success.status || !preAuthResult.success.data) {
      throw new Error('Pre-authentication failed');
    }

    const {
      codeVerifier,
      credentialDefinition,
      requestObject,
      clientId,
      credentialType,
      issuerConf,
      redirectUri
    } = preAuthResult.success.data;

    /**
     * Get the PID from the store and throw an error if it's not found.
     * Also generate its cryptocontext.
     */
    const pid = yield* select(selectCredential(wellKnownCredential.PID));
    if (!pid) {
      throw new Error('PID not found');
    }
    const pidCryptoContext = createCryptoContextFor(pid.keyTag);

    /**
     * Get the wallet instance attestation from the store and throw an error if it's not found.
     * Also generate its cryptocontext.
     */
    const walletInstanceAttestation = yield* select(selectAttestation);
    if (!walletInstanceAttestation) {
      throw new Error('Wallet instance attestation not found');
    }
    const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    yield* call(generate, credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

    // Complete the user authorization via form_post.jwt mode
    const {code} = yield* call(
      Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode,
      requestObject,
      {
        wiaCryptoContext,
        pidCryptoContext,
        pid: pid.credential,
        walletInstanceAttestation
      }
    );

    // Generate the DPoP context which will be used for the whole issuance flow
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

    // Obtain the credential
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

    // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
    const {parsedCredential} = yield* call(
      Credential.Issuance.verifyAndParseCredential,
      issuerConf,
      credential,
      format,
      {credentialCryptoContext, ignoreMissingAttributes: true}
    );

    yield* put(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          parsedCredential,
          credentialType,
          keyTag: credentialKeyTag
        }
      })
    );
  } catch (error) {
    yield* put(
      setCredentialIssuancePostAuthError({error: JSON.stringify(error)})
    );
  }
}

/**
 * Saga to store the PID credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the PID is stored and the lifecycle is set to `LIFECYCLE_VALID`.
 */
function* storePidWithIdentification(
  action: ReturnType<typeof addCredentialWithIdentification>
) {
  yield* put(
    setIdentificationStarted({canResetPin: false, isValidatingTask: true})
  );
  const resAction = yield* take([
    setIdentificationIdentified,
    setIdentificationUnidentified
  ]);
  if (setIdentificationIdentified.match(resAction)) {
    yield* put(addCredential({credential: action.payload.credential}));
    yield* put(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_VALID}));
    navigate('MAIN_TAB_NAV');
    IOToast.success(i18next.t('buttons.done', {ns: 'global'}));
  } else {
    return;
  }
}
