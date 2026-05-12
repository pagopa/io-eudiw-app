import { generate } from '@pagopa/io-react-native-crypto';
import {
  createCryptoContextFor,
  IoWallet
} from '@pagopa/io-react-native-wallet';
import { isAnyOf } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { serializeError } from 'serialize-error';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { setCredentialIssuancePreAuthRequest } from '../store/credentialIssuance';
import { addCredential, addPidWithIdentification } from '../store/credentials';
import { Lifecycle, setLifecycle } from '../store/lifecycle';
import { selectPendingCredential } from '../store/selectors/pidIssuance';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { wellKnownCredentialConfigurationIDs } from '../utils/credentials';
import { DPOP_KEYTAG, WIA_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { StoredCredential } from '../utils/itwTypesUtils';
import { createAppAsyncThunk } from './thunk';
import {
  isAndroid,
  regenerateCryptoKey,
  takeLatestEffect
} from '@io-eudiw-app/commons';
import { AppListenerWithAction, AppStartListening } from './types';
import { getEnv } from '@io-eudiw-app/env';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import MAIN_ROUTES from '../navigation/main/routes';
import { navigator } from '../navigation/utils';
import { selectSessionId } from '../store/instance';
import {
  getWalletInstanceAttestationThunk,
  getWalletUnitAttestationThunk
} from './attestation';
import { selectWalletInstanceAttestationAsJwt } from '../store/attestation';

/**
 * Thunk to obtain the PID credential.
 * Replaces the obtainPidListener logic.
 */
export const obtainPidThunk = createAppAsyncThunk<StoredCredential>(
  'pidIssuance/obtainPid',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
      const {
        EXPO_PUBLIC_PID_PROVIDER_BASE_URL,
        EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri,
        EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl
      } = getEnv();

      await dispatch(getWalletInstanceAttestationThunk());

      const walletInstanceAttestation =
        selectWalletInstanceAttestationAsJwt(getState());

      if (!walletInstanceAttestation) {
        throw new Error('Wallet Instance Attestation not found');
      }

      const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

      // Start the issuance flow
      const sessionId = selectSessionId(getState());
      const appFetch = createWalletProviderFetch(
        walletProviderBaseUrl,
        sessionId
      );

      const issuerUrl = EXPO_PUBLIC_PID_PROVIDER_BASE_URL;

      // Evaluate issuer trust
      const { issuerConf } =
        await wallet.CredentialIssuance.evaluateIssuerTrust(issuerUrl, {
          appFetch
        });

      // Start user authorization
      const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
        await wallet.CredentialIssuance.startUserAuthorization(
          issuerConf,
          ['dc_sd_jwt_PersonIdentificationData'],
          { proofType: 'none' },
          {
            walletInstanceAttestation,
            redirectUri: redirectUri,
            wiaCryptoContext,
            appFetch
          }
        );

      // Obtain the Authorization URL
      const { authUrl } = await wallet.CredentialIssuance.buildAuthorizationUrl(
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
        await wallet.CredentialIssuance.completeUserAuthorizationWithQueryMode(
          authRedirectUrl.url
        );

      // Create credential crypto context
      const credentialKeyTag = Crypto.randomUUID().toString();
      await generate(credentialKeyTag);
      const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

      // Create DPoP context for the whole issuance flow
      await regenerateCryptoKey(DPOP_KEYTAG);
      const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

      const { accessToken } = await wallet.CredentialIssuance.authorizeAccess(
        issuerConf,
        code,
        redirectUri,
        codeVerifier,
        {
          walletInstanceAttestation,
          wiaCryptoContext,
          dPopCryptoContext
        }
      );

      const [pidCredentialDefinition] = credentialDefinition;
      // Get the credential configuration ID for PID
      const pidCredentialConfigId =
        pidCredentialDefinition?.type === 'openid_credential' &&
        pidCredentialDefinition?.credential_configuration_id;

      const { credential_configuration_id, credential_identifiers } =
        accessToken.authorization_details.find(
          authDetails =>
            authDetails.credential_configuration_id === pidCredentialConfigId
        ) ?? {};

      // Get the first credential_identifier from the access token's authorization details
      const [credential_identifier] = credential_identifiers ?? [];

      if (!credential_configuration_id) {
        throw new Error('No credential configuration ID found for PID');
      }

      const walletUnitAttestation = await dispatch(
        getWalletUnitAttestationThunk({
          keyTags: [credentialKeyTag]
        })
      ).unwrap();

      // Get the credential identifier that was authorized
      const { credential, format } =
        await wallet.CredentialIssuance.obtainCredential(
          issuerConf,
          accessToken,
          clientId,
          {
            credential_configuration_id,
            credential_identifier
          },
          {
            credentialCryptoContext,
            dPopCryptoContext,
            walletUnitAttestation: walletUnitAttestation.attestation,
            appFetch
          }
        );

      const { parsedCredential, expiration, issuedAt } =
        await wallet.CredentialIssuance.verifyAndParseCredential(
          issuerConf,
          credential,
          credential_configuration_id,
          { credentialCryptoContext, ignoreMissingAttributes: true }
        );

      return {
        parsedCredential,
        credential,
        credentialType: wellKnownCredentialConfigurationIDs.PID,
        keyTag: credentialKeyTag,
        format,
        expiration: expiration.toISOString(),
        issuedAt: issuedAt?.toISOString(),
        issuerConf,
        spec_version: WALLET_SPEC_VERSION
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
      navigator.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
      });
    } else {
      // This should not happen, so by default the flow will just reset navigation and go back home
      navigator.navigateWithReset(MAIN_ROUTES.TAB_NAV);
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
