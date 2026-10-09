import { isAndroid, regenerateCryptoKey } from '@io-eudiw-app/commons';
import { getEnv } from '@io-eudiw-app/env';
import {
  createCryptoContextFor,
  IoWallet
} from '@pagopa/io-react-native-wallet';
import { TaskAbortError } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import { selectWalletInstanceAttestationAsJwt } from '../store/attestationSelectors';
import {
  selectRequestedCredential,
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthSuccess,
  setCredentialIssuancePreAuthRequest
} from '../store/credentialIssuance';
import {
  selectInstanceKeyTag,
  selectSessionId
} from '../store/instanceSelectors';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import {
  wellKnownCredential,
  wellKnownCredentialConfigurationIDs
} from '../utils/credentials';
import { DPOP_KEYTAG, WIA_KEYTAG } from '../utils/crypto';
import { serializeErrorOrUnknown } from '../utils/errors';
import { createWalletFetch } from '../utils/fetch';
import {
  getKeyAttestationThunk,
  getWalletInstanceAttestationThunk
} from './attestation';
import { AppListenerWithAction, AppStartListening } from './types';

/**
 * Listener which obtains the PID credential.
 * It is triggered through the standard credential issuance action and drives
 * the PID-specific OID4VCI exchange.
 */
const obtainPidListener: AppListenerWithAction<
  ReturnType<typeof setCredentialIssuancePreAuthRequest>
> = async (_, listenerApi) => {
  const { dispatch, getState } = listenerApi;
  try {
    if (
      selectRequestedCredential(getState()) !==
      wellKnownCredentialConfigurationIDs.PID
    ) {
      return;
    }
    if (!selectInstanceKeyTag(getState())) {
      throw new Error('Wallet Instance is not active');
    }
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const {
      EXPO_PUBLIC_PID_PROVIDER_BASE_URL,
      EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri
    } = getEnv();

    await dispatch(getWalletInstanceAttestationThunk()).unwrap();

    const walletInstanceAttestation =
      selectWalletInstanceAttestationAsJwt(getState());

    if (!walletInstanceAttestation) {
      throw new Error('Wallet Instance Attestation not found');
    }

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    // Start the issuance flow
    const sessionId = selectSessionId(getState());
    const appFetch = createWalletFetch(sessionId);

    const issuerUrl = EXPO_PUBLIC_PID_PROVIDER_BASE_URL;

    // Evaluate issuer trust
    const { issuerConf } = await wallet.CredentialIssuance.evaluateIssuerTrust(
      issuerUrl,
      {
        appFetch
      }
    );

    // Start user authorization
    const { clientId, codeVerifier, credentialDefinition, issuerRequestUri } =
      await wallet.CredentialIssuance.startUserAuthorization(
        issuerConf,
        ['dc_sd_jwt_PersonIdentificationData'],
        { proofType: 'none' },
        {
          appFetch,
          redirectUri: redirectUri,
          walletInstanceAttestation,
          wiaCryptoContext
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
        throw new Error('No browser found to open the authentication session');
      }
      await WebBrowser.warmUpAsync();
    }

    const baseRedirectUri = `${new URL(redirectUri).protocol}//`;
    const authRedirectUrl = await WebBrowser.openAuthSessionAsync(
      authUrl,
      baseRedirectUri,
      {
        createTask: false,
        preferEphemeralSession: true
      }
    );

    if (authRedirectUrl.type !== 'success' || !authRedirectUrl.url) {
      throw new Error('Authorization flow was not completed successfully.');
    }

    const { code } =
      await wallet.CredentialIssuance.completePidUserAuthorizationWithQueryMode(
        authRedirectUrl.url
      );

    // Create credential crypto context
    const credentialKeyTag = Crypto.randomUUID().toString();

    // Create DPoP context for the whole issuance flow
    await regenerateCryptoKey(DPOP_KEYTAG);
    const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

    const { accessToken } = await wallet.CredentialIssuance.authorizeAccess(
      issuerConf,
      code,
      redirectUri,
      codeVerifier,
      {
        appFetch,
        dPopCryptoContext,
        walletInstanceAttestation,
        wiaCryptoContext
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

    const keyAttestation = await dispatch(
      getKeyAttestationThunk({
        keyTags: [credentialKeyTag]
      })
    ).unwrap();

    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

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
          appFetch,
          credentialCryptoContext,
          dPopCryptoContext,
          keyAttestation: keyAttestation.attestation
        }
      );

    const { expiration, issuedAt, parsedCredential } =
      await wallet.CredentialIssuance.verifyAndParseCredential(
        issuerConf,
        credential,
        credential_configuration_id,
        { credentialCryptoContext, ignoreMissingAttributes: true }
      );

    dispatch(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          credentialType: wellKnownCredential.PID,
          expiration: expiration.toISOString(),
          format,
          issuedAt: issuedAt?.toISOString(),
          issuerConf,
          keyTag: credentialKeyTag,
          parsedCredential,
          spec_version: WALLET_SPEC_VERSION
        }
      })
    );
  } catch (error) {
    // Ignore if the task was aborted (e.g. the user left the screen)
    if (error instanceof TaskAbortError) {
      return;
    }
    const serialized = serializeErrorOrUnknown(error);
    dispatch(setCredentialIssuancePostAuthError({ error: serialized }));
  }
};

export const addPidListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: setCredentialIssuancePreAuthRequest,
    effect: obtainPidListener
  });
};
