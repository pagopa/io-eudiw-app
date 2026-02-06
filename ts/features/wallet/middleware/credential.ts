import { IOToast } from '@pagopa/io-app-design-system';
import { generate } from '@pagopa/io-react-native-crypto';
import { CryptoContext } from '@pagopa/io-react-native-jwt';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import {
  EvaluateIssuerTrust,
  StartUserAuthorization
} from '@pagopa/io-react-native-wallet/lib/typescript/credential/issuance';
import { Out } from '@pagopa/io-react-native-wallet/lib/typescript/utils/misc';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import * as WebBrowser from 'expo-web-browser';
import i18next from 'i18next';
import uuid from 'react-native-uuid';
import { getEnv } from '../../../../ts/config/env';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../middleware/listener';
import {
  raceEffect,
  takeLatestEffect
} from '../../../middleware/listener/effects';
import { navigateWithReset } from '../../../navigation/utils';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import { selectSessionId } from '../../../store/reducers/preferences';
import { regenerateCryptoKey } from '../../../utils/crypto';
import { isAndroid } from '../../../utils/device';
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
import { getAttestationThunk } from './attestation';

/**
 * Helper to obtain the authorization code based on the credential type.
 * Handles the distinction between API-based issuance (Disability Card)
 * and browser-based issuance (all the other credentials).
 */
const getCredentialAuthCode = async (params: {
  credentialType: string;
  pid: StoredCredential | undefined;
  issuerRequestUri: string;
  clientId: Out<StartUserAuthorization>['clientId'];
  issuerConf: Out<EvaluateIssuerTrust>['issuerConf'];
  appFetch: GlobalFetch['fetch'];
  wiaCryptoContext: CryptoContext;
  redirectUri: string;
  authUrl: string;
}) => {
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

    const requestObject =
      await Credential.Issuance.getRequestedCredentialToBePresented(
        issuerRequestUri,
        clientId,
        issuerConf,
        appFetch
      );

    const { code } =
      await Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode(
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
    const baseRedirectUri = `${new URL(redirectUri).protocol}//`;
    const authRedirectUrl = await WebBrowser.openAuthSessionAsync(
      authUrl,
      baseRedirectUri,
      {
        preferEphemeralSession: true
      }
    );

    if (authRedirectUrl.type !== 'success' || !authRedirectUrl.url) {
      throw new Error('Authorization flow was not completed successfully.');
    }

    const { code } =
      await Credential.Issuance.completeUserAuthorizationWithQueryMode(
        authRedirectUrl.url
      );

    return code;
  }
};

/**
 * Function which handles the issuance of a credential.
 * The related state is divided in two parts, pre and post authorization.
 * Pre authorization is the phase before the user is asked to authorize the presentation of the required credentials and claims to the issuer.
 * Post authorization is the phase after the user has authorized the presentation of the required credentials and claims to the issuer.
 * Currently the flow is not complete and thus the authorization is mocked and asks for the whole PID.
 */
const obtainCredentialListener: AppListenerWithAction<
  ReturnType<typeof setCredentialIssuancePreAuthRequest>
> = async (_, listenerApi) => {
  try {
    // On Android check if there is a browser to open the authentication session and then warm it up
    if (isAndroid) {
      const { browserPackages } =
        await WebBrowser.getCustomTabsSupportingBrowsersAsync();
      if (browserPackages.length === 0) {
        throw new Error('No browser found to open the authentication session');
      }
      await WebBrowser.warmUpAsync();
    }

    const {
      EXPO_PUBLIC_EAA_PROVIDER_BASE_URL,
      EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri,
      EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl
    } = getEnv();

    /**
     * Check the passed credential type and throw an error if it's not found.
     */
    const state = listenerApi.getState();
    const credentialConfigId = selectRequestedCredential(state);
    if (!credentialConfigId) {
      throw new Error('Credential type not found');
    }
    // Get the wallet instance attestation and generate its crypto context
    const walletInstanceAttestation = await listenerApi.dispatch(
      getAttestationThunk()
    );

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    // Create credential crypto context
    const credentialKeyTag = uuid.v4().toString();
    await generate(credentialKeyTag);
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

    const sessionId = selectSessionId(state);
    const pid = selectCredential(wellKnownCredential.PID)(state);
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
    const { issuerConf } =
      await Credential.Issuance.evaluateIssuerTrust(issuerUrl);

    // Start user authorization
    const { issuerRequestUri, clientId, codeVerifier } =
      await Credential.Issuance.startUserAuthorization(
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

    listenerApi.dispatch(
      setCredentialIssuancePreAuthSuccess({
        result: true,
        credentialType
      })
    );
    await listenerApi.take(isAnyOf(setCredentialIssuancePostAuthRequest));

    // Obtain the Authorization URL
    const { authUrl } = await Credential.Issuance.buildAuthorizationUrl(
      issuerRequestUri,
      clientId,
      issuerConf
    );

    const credentialCode = await getCredentialAuthCode({
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
    await regenerateCryptoKey(DPOP_KEYTAG);
    const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

    const { accessToken } = await Credential.Issuance.authorizeAccess(
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

    const { credential, format } = await Credential.Issuance.obtainCredential(
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
    const { parsedCredential, expiration, issuedAt } =
      await Credential.Issuance.verifyAndParseCredential(
        issuerConf,
        credential,
        credential_configuration_id,
        {
          credentialCryptoContext,
          ignoreMissingAttributes: true
        }
        // 'x509CertRoot'
      );

    listenerApi.dispatch(
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
    // Ignore if the task was aborted
    if (error instanceof TaskAbortError) {
      return;
    }
    // We put the error in both the pre and post auth status as we are unsure where the error occurred.
    const serializableError = JSON.stringify(error);
    listenerApi.dispatch(
      setCredentialIssuancePostAuthError({ error: serializableError })
    );
    listenerApi.dispatch(
      setCredentialIssuancePreAuthError({ error: serializableError })
    );
  }
};

/**
 * Listener to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
export const addCredentialWithAuthListener: AppListenerWithAction<
  ReturnType<typeof addCredentialWithIdentification>
> = async (action, listenerApi) => {
  listenerApi.dispatch(
    setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
  );
  const resAction = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  if (setIdentificationIdentified.match(resAction[0])) {
    listenerApi.dispatch(addCredential(action.payload));
    listenerApi.dispatch(resetCredentialIssuance());
    navigateWithReset('MAIN_TAB_NAV');
    IOToast.success(i18next.t('buttons.done', { ns: 'global' }));
  } else {
    return;
  }
};

export const addCredentialListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    actionCreator: setCredentialIssuancePreAuthRequest,
    effect: raceEffect(obtainCredentialListener, [
      listenerApi => listenerApi.take(isAnyOf(resetCredentialIssuance))
    ])
  });

  startAppListening({
    actionCreator: addCredentialWithIdentification,
    effect: takeLatestEffect(addCredentialWithAuthListener)
  });
};
