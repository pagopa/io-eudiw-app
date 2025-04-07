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
import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
import {selectAttestation} from '../store/attestation';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import {navigateWithReset} from '../../../navigation/utils';
import {
  addCredential,
  addCredentialWithIdentification
} from '../store/credentials';
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
 * Function which handles the issuance of a credential.
 * The related state is divided in two parts, pre and post authorization.
 * Pre authorization is the phase before the user is asked to authorize the presentation of the required credentials and claims to the issuer.
 * Post authorization is the phase after the user has authorized the presentation of the required credentials and claims to the issuer.
 * Currently the flow is not complete and thus the authorization is mocked and asks for the whole PID.
 */
function* obtainCredential() {
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

    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    yield* call(generate, credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

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

    /**
     * Temporary comments to permit issuing of mDL without PID presentation
     * Replace with block code below which redirects to the issuer's authorization URL
     * FIXME: [WLEO-267]
     * */

    // const requestObject =
    //   await Credential.Issuance.getRequestedCredentialToBePresented(
    //     issuerRequestUri,
    //     clientId,
    //     issuerConf,
    //     appFetch
    //   );

    // The app here should ask the user to confirm the required data contained in the requestObject

    // Complete the user authorization via form_post.jwt mode
    // const { code } =
    //   await Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode(
    //     requestObject,
    //     { wiaCryptoContext, pidCryptoContext, pid, walletInstanceAttestation }
    //   );
    // Start user authorization

    yield* put(setCredentialIssuancePreAuthSuccess({result: true}));
    yield* take(setCredentialIssuancePostAuthRequest);

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
    /* End of temporary block code */

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
      credentialType,
      {credentialCryptoContext, ignoreMissingAttributes: true}
    );

    yield* put(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          parsedCredential,
          credentialType,
          keyTag: credentialKeyTag,
          format
        }
      })
    );
  } catch (error) {
    // We put the error in both the pre and post auth status as we are unsure where the error occurred.
    const serializableError = JSON.stringify(error);
    yield* put(setCredentialIssuancePostAuthError({error: serializableError}));
    yield* put(setCredentialIssuancePreAuthError({error: serializableError}));
  }
}

/**
 * Saga to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
function* storeCredentialWithIdentification(
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
    yield* put(resetCredentialIssuance());
    navigateWithReset('MAIN_TAB_NAV');
    IOToast.success(i18next.t('buttons.done', {ns: 'global'}));
  } else {
    return;
  }
}
