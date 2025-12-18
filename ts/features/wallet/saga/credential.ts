import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import Config from 'react-native-config';
import uuid from 'react-native-uuid';
import {generate} from '@pagopa/io-react-native-crypto';
import {IOToast} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {isAnyOf} from '@reduxjs/toolkit';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
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
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../listener/listenerMiddleware';
import {getAttestation} from './attestation';

const obtainCredentialListener: AppListenerWithAction<
  ReturnType<typeof setCredentialIssuancePreAuthRequest>
> = async (_, listenerApi) => {
  try {
    const {EAA_PROVIDER_BASE_URL, PID_REDIRECT_URI: redirectUri} = Config;

    /**
     * Check the passed credential type and throw an error if it's not found.
     */
    const state = listenerApi.getState();
    const credentialConfigId = selectRequestedCredential(state);
    if (!credentialConfigId) {
      throw new Error('Credential type not found');
    }
    // Get the wallet instance attestation and generate its crypto context
    const walletInstanceAttestation = await getAttestation(listenerApi);

    const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');
    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    await generate(credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);
    // Start the issuance flow
    const startFlow: Credential.Issuance.StartFlow = () => ({
      issuerUrl: EAA_PROVIDER_BASE_URL,
      credentialType: credentialConfigId
    });
    const {issuerUrl} = startFlow();

    // Evaluate issuer trust
    const {issuerConf} = await Credential.Issuance.getIssuerConfigOIDFED(
      issuerUrl
    );

    // Start user authorization
    const {issuerRequestUri, clientId, codeVerifier, credentialDefinition} =
      await Credential.Issuance.startUserAuthorization(
        issuerConf,
        credentialConfigId,
        {
          walletInstanceAttestation,
          redirectUri,
          wiaCryptoContext
        }
      );
    // Extract the credential type from the config
    const credentialConfig =
      issuerConf.credential_configurations_supported[credentialConfigId];
    const credentialType =
      credentialConfig.format === 'mso_mdoc'
        ? credentialConfig.scope
        : credentialConfig.vct;
    if (!credentialType) {
      throw new Error(
        `Error: The selected credential config doesn't have a credentialType`
      );
    }

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

    listenerApi.dispatch(
      setCredentialIssuancePreAuthSuccess({result: true, credentialType})
    );
    await listenerApi.take(isAnyOf(setCredentialIssuancePostAuthRequest));

    // Obtain the Authorization URL
    const {authUrl} = await Credential.Issuance.buildAuthorizationUrl(
      issuerRequestUri,
      clientId,
      issuerConf
    );

    const supportsCustomTabs = await supportsInAppBrowser();
    if (!supportsCustomTabs) {
      throw new Error('Custom tabs are not supported');
    }

    const baseRedirectUri = new URL(redirectUri).protocol.replace(':', '');

    // Open the authorization URL in the custom tab
    const authRedirectUrl = await openAuthenticationSession(
      authUrl,
      baseRedirectUri
    );

    const {code} =
      await Credential.Issuance.completeUserAuthorizationWithQueryMode(
        authRedirectUrl
      );
    /* End of temporary block code */

    // Generate the DPoP context which will be used for the whole issuance flow
    await regenerateCryptoKey(DPOP_KEYTAG);
    const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

    const {accessToken} = await Credential.Issuance.authorizeAccess(
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
    const {credential, format} = await Credential.Issuance.obtainCredential(
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
    const {parsedCredential} =
      await Credential.Issuance.verifyAndParseCredential(
        issuerConf,
        credential,
        format,
        credentialConfigId,
        {credentialCryptoContext, ignoreMissingAttributes: true}
      );

    listenerApi.dispatch(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          parsedCredential,
          credentialType,
          keyTag: credentialKeyTag,
          format: format as 'vc+sd-jwt' | 'mso_mdoc'
        }
      })
    );
  } catch (error) {
    // We put the error in both the pre and post auth status as we are unsure where the error occurred.
    const serializableError = JSON.stringify(error);
    listenerApi.dispatch(
      setCredentialIssuancePostAuthError({error: serializableError})
    );
    listenerApi.dispatch(
      setCredentialIssuancePreAuthError({error: serializableError})
    );
  }
};

/**
 * Saga to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
const addCredentialWithAuthListener: AppListenerWithAction<
  ReturnType<typeof addCredentialWithIdentification>
> = async (action, listenerApi) => {
  listenerApi.dispatch(
    setIdentificationStarted({canResetPin: false, isValidatingTask: true})
  );
  const resAction = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  if (setIdentificationIdentified.match(resAction[0])) {
    listenerApi.dispatch(addCredential(action.payload));
    listenerApi.dispatch(resetCredentialIssuance());
    navigateWithReset('MAIN_TAB_NAV');
    IOToast.success(i18next.t('buttons.done', {ns: 'global'}));
  } else {
    return;
  }
};

export const addCredentialListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: setCredentialIssuancePreAuthRequest,
    effect: async (action, listenerApi) => {
      // This works as a takelatest with a race
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(15);
      const abortPromise = new Promise<void>(resolve => {
        startAppListening({
          actionCreator: resetCredentialIssuance,
          effect: () => resolve()
        });
      });
      await Promise.race([
        obtainCredentialListener(action, listenerApi),
        abortPromise
      ]);
    }
  });
  startAppListening({
    actionCreator: addCredentialWithIdentification,
    effect: async (action, listenerApi) => {
      // This works as a takeLatest
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(15);
      await addCredentialWithAuthListener(action, listenerApi);
    }
  });
};
