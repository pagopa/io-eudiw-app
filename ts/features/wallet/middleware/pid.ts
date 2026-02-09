import { generate } from '@pagopa/io-react-native-crypto';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import { isAnyOf } from '@reduxjs/toolkit';
import * as WebBrowser from 'expo-web-browser';
import uuid from 'react-native-uuid';
import { serializeError } from 'serialize-error';
import { getEnv } from '../../../config/env';
import { takeLatestEffect } from '../../../middleware/listener/effects';
import { createAppAsyncThunk } from '../../../middleware/thunk';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { navigate, navigateWithReset } from '../../../navigation/utils';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import { selectSessionId } from '../../../store/reducers/preferences';
import { regenerateCryptoKey } from '../../../utils/crypto';
import { isAndroid } from '../../../utils/device';
import WALLET_ROUTES from '../navigation/routes';
import { setCredentialIssuancePreAuthRequest } from '../store/credentialIssuance';
import { addCredential, addPidWithIdentification } from '../store/credentials';
import { Lifecycle, setLifecycle } from '../store/lifecycle';
import { wellKnownCredentialConfigurationIDs } from '../utils/credentials';
import { DPOP_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { StoredCredential } from '../utils/itwTypesUtils';
import { selectPendingCredential } from '../store/selectors/pidIssuance';
import { getAttestationThunk } from './attestation';
import {
  AppListenerWithAction,
  AppStartListening
} from '@/ts/middleware/listener/types';

/**
 * Thunk to obtain the PID credential.
 * Replaces the obtainPidListener logic.
 */
export const obtainPidThunk = createAppAsyncThunk<StoredCredential, void>(
  'pidIssuanceStatus/obtainPid',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const {
        EXPO_PUBLIC_PID_PROVIDER_BASE_URL,
        EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri,
        EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl
      } = getEnv();
      const state = getState();

      const walletInstanceAttestation = await dispatch(getAttestationThunk());

      const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

      // Start the issuance flow
      const sessionId = selectSessionId(state);
      const appFetch = createWalletProviderFetch(
        walletProviderBaseUrl,
        sessionId
      );

      const issuerUrl = EXPO_PUBLIC_PID_PROVIDER_BASE_URL;
      const credentialConfigId = wellKnownCredentialConfigurationIDs.PID;

      // Evaluate issuer trust
      const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
        issuerUrl,
        { appFetch }
      );

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
          "The selected credential config doesn't have a credentialType"
        );
      }

      // Obtain the Authorization URL
      const { authUrl } = await Credential.Issuance.buildAuthorizationUrl(
        issuerRequestUri,
        clientId,
        issuerConf
      );

      // On Android check if there is a browser to open the authentication session and then warm it up
      if (isAndroid) {
        const { browserPackages } =
          await WebBrowser.getCustomTabsSupportingBrowsersAsync();
        if (browserPackages.length === 0) {
          throw new Error(
            'No browser found to open the authentication session'
          );
        }
        await WebBrowser.warmUpAsync();
      }

      const baseRedirectUri = `${new URL(redirectUri).protocol}//`;
      const authRedirectUrl = await WebBrowser.openAuthSessionAsync(
        authUrl,
        baseRedirectUri,
        {
          preferEphemeralSession: true,
          createTask: false
        }
      );

      if (authRedirectUrl.type !== 'success' || !authRedirectUrl.url) {
        throw new Error('Authorization flow was not completed successfully.');
      }

      const { code } =
        await Credential.Issuance.completeUserAuthorizationWithQueryMode(
          authRedirectUrl.url
        );

      // Create credential crypto context
      const credentialKeyTag = uuid.v4().toString();
      await generate(credentialKeyTag);
      const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

      // Create DPoP context for the whole issuance flow
      await regenerateCryptoKey(DPOP_KEYTAG);
      const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

      const { accessToken } = await Credential.Issuance.authorizeAccess(
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
      // # TODO: WLEO-727 - rework to support multiple credentials issuance
      const { credential_configuration_id, credential_identifiers } =
        accessToken.authorization_details[0]!;

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

      const { parsedCredential, expiration, issuedAt } =
        await Credential.Issuance.verifyAndParseCredential(
          issuerConf,
          credential,
          credential_configuration_id,
          { credentialCryptoContext }
        );

      return {
        parsedCredential,
        credential,
        credentialType,
        keyTag: credentialKeyTag,
        format: format as 'vc+sd-jwt' | 'mso_mdoc',
        expiration: expiration.toISOString(),
        issuedAt: issuedAt?.toISOString(),
        issuerConf
      };
    } catch (error) {
      const serialized = serializeError(error);
      return rejectWithValue(serialized);
    }
  }
);

/**
 * Listener to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
const addPidWithAuthListener: AppListenerWithAction<
  ReturnType<typeof addPidWithIdentification>
> = async (action, listenerApi) => {
  listenerApi.dispatch(
    setIdentificationStarted({ canResetPin: false, isValidatingTask: true })
  );
  const resAction = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  if (setIdentificationIdentified.match(resAction[0])) {
    listenerApi.dispatch(
      addCredential({ credential: action.payload.credential })
    );
    listenerApi.dispatch(
      setLifecycle({ lifecycle: Lifecycle.LIFECYCLE_VALID })
    );
    // Get the pending required credential to be obtained after the Pid
    const pendingCredential = selectPendingCredential(listenerApi.getState());
    if (pendingCredential) {
      listenerApi.dispatch(
        setCredentialIssuancePreAuthRequest({ credential: pendingCredential })
      );
      navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
      });
    } else {
      // This should not happen, so by default the flow will just reset navigation and go back home
      navigateWithReset(MAIN_ROUTES.TAB_NAV);
    }
  } else {
    return;
  }
};

export const addPidListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: addPidWithIdentification,
    effect: takeLatestEffect(addPidWithAuthListener)
  });
};
