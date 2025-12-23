import {
  openAuthenticationSession,
  supportsInAppBrowser
} from '@pagopa/io-react-native-login-utils';
import {
  createCryptoContextFor,
  Credential
} from '@pagopa/io-react-native-wallet';
import Config from 'react-native-config';
import uuid from 'react-native-uuid';
import {generate} from '@pagopa/io-react-native-crypto';
import {serializeError} from 'serialize-error';
import {isAnyOf} from '@reduxjs/toolkit';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG} from '../utils/crypto';
import {Lifecycle, setLifecycle} from '../store/lifecycle';
import {navigate} from '../../../navigation/utils';
import {addCredential, addPidWithIdentification} from '../store/credentials';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../../store/reducers/identification';
import {AppListenerWithAction} from '../../../middleware/listener';
import {wellKnownCredentialConfigurationIDs} from '../utils/credentials';
import {selectSessionId} from '../../../store/reducers/preferences';
import {createWalletProviderFetch} from '../utils/fetch';
import {StoredCredential} from '../utils/types';
import {createAppAsyncThunk} from '../../../middleware/thunk';
import {getAttestationThunk} from './attestation';

/**
 * Thunk to obtain the PID credential.
 * Replaces the obtainPidListener logic.
 */
export const obtainPidThunk = createAppAsyncThunk<StoredCredential, void>(
  'pidIssuanceStatus/obtainPid',
  async (_, {getState, dispatch, rejectWithValue}) => {
    try {
      const {PID_PROVIDER_BASE_URL, PID_REDIRECT_URI: redirectUri} = Config;
      const state = getState();

      const walletInstanceAttestation = await dispatch(getAttestationThunk());

      const wiaCryptoContext = createCryptoContextFor('WIA_KEYTAG');

      // Start the issuance flow
      const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
      const sessionId = selectSessionId(state);
      const appFetch = createWalletProviderFetch(
        walletProviderBaseUrl,
        sessionId
      );

      const issuerUrl = PID_PROVIDER_BASE_URL;
      const credentialConfigId = wellKnownCredentialConfigurationIDs.PID;

      // Evaluate issuer trust
      const {issuerConf} = await Credential.Issuance.evaluateIssuerTrust(
        issuerUrl,
        {appFetch}
      );

      // Start user authorization
      const {issuerRequestUri, clientId, codeVerifier} =
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
      const authRedirectUrl = await openAuthenticationSession(
        authUrl,
        baseRedirectUri
      );

      const {code} =
        await Credential.Issuance.completeUserAuthorizationWithQueryMode(
          authRedirectUrl
        );

      // Create credential crypto context
      const credentialKeyTag = uuid.v4().toString();
      await generate(credentialKeyTag);
      const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

      // Create DPoP context for the whole issuance flow
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
      // # TODO: WLEO-727 - rework to support multiple credentials issuance
      const {credential_configuration_id, credential_identifiers} =
        accessToken.authorization_details[0]!;

      const {credential, format} = await Credential.Issuance.obtainCredential(
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

      const {parsedCredential} =
        await Credential.Issuance.verifyAndParseCredential(
          issuerConf,
          credential,
          credential_configuration_id,
          {credentialCryptoContext}
        );

      return {
        parsedCredential,
        credential,
        credentialType,
        keyTag: credentialKeyTag,
        format: format as 'vc+sd-jwt' | 'mso_mdoc'
      };
    } catch (error) {
      const serialized = serializeError(error);
      return rejectWithValue(serialized);
    }
  }
);

/**
 * Saga to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
export const addPidWithAuthListener: AppListenerWithAction<
  ReturnType<typeof addPidWithIdentification>
> = async (action, listenerApi) => {
  listenerApi.dispatch(
    setIdentificationStarted({canResetPin: false, isValidatingTask: true})
  );
  const resAction = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  if (setIdentificationIdentified.match(resAction[0])) {
    listenerApi.dispatch(
      addCredential({credential: action.payload.credential})
    );
    listenerApi.dispatch(
      addCredential({credential: action.payload.credential})
    );
    listenerApi.dispatch(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_VALID}));
    navigate('MAIN_WALLET_NAV', {screen: 'PID_ISSUANCE_SUCCESS'});
  } else {
    return;
  }
};
