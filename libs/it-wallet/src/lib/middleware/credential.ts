import { IOToast } from '@pagopa/io-app-design-system';
import {
  createCryptoContextFor,
  IoWallet,
  RemotePresentation
} from '@pagopa/io-react-native-wallet';
import { isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import { t } from 'i18next';
import {
  resetCredentialIssuance,
  selectRequestedCredential,
  selectRequestedCredentialIssuerUrl,
  selectRequestedCredentialOffer,
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
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { wellKnownCredential } from '../utils/credentials';
import { DPOP_KEYTAG, WIA_KEYTAG } from '../utils/crypto';
import { createWalletFetch } from '../utils/fetch';
import { enrichPresentationDetails } from '../utils/itwClaimsUtils';
import { CredentialFormat } from '../utils/itwTypesUtils';
import {
  getWalletInstanceAttestationThunk,
  getWalletUnitAttestationThunk
} from './attestation';
import { getEnv } from '@io-eudiw-app/env';
import { AppListenerWithAction, AppStartListening } from './types';
import {
  raceEffect,
  regenerateCryptoKey,
  takeLatestEffect
} from '@io-eudiw-app/commons';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import { navigator } from '../navigation/utils';
import { selectSessionId } from '../store/instance';
import {
  selectWalletInstanceAttestationAsJwt,
  shouldRequestWalletInstanceAttestationSelector
} from '../store/attestation';
import { getInvalidCredentials } from '../utils/itwCredentialStatusUtils';
import { serializeErrorOrUnknown } from '../utils/errors';
import { createAppAsyncThunk } from './thunk';
import { ResolvedCredentialOffer } from '../types';

type DcqlQuery = Parameters<
  RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']
>[0];

/**
 * Thunk which resolves and validates a credential offer received via deep link
 * or QR code (OID4VCI, see the IT-Wallet credential offer flow). It supports
 * both by-value and by-reference offers and returns the issuer URL and the
 * first advertised credential configuration id, which are then used to drive
 * the regular issuance flow.
 * The `scope` is intentionally not handled at this stage.
 */
export const resolveCredentialOfferThunk = createAppAsyncThunk<
  ResolvedCredentialOffer,
  { url: string }
>(
  'credentialIssuance/resolveOffer',
  async ({ url }, { getState, rejectWithValue }) => {
    try {
      const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
      const sessionId = selectSessionId(getState());
      const appFetch = createWalletFetch(sessionId);

      const offer = await wallet.CredentialsOffer.resolveCredentialOffer(url, {
        fetch: appFetch
      });

      const [credentialConfigId] = offer.credential_configuration_ids;
      if (!credentialConfigId) {
        throw new Error(
          'The credential offer does not contain any credential configuration id'
        );
      }

      return offer;
    } catch (error) {
      return rejectWithValue(serializeErrorOrUnknown(error));
    }
  }
);

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
    const {
      EXPO_PUBLIC_EAA_PROVIDER_BASE_URL: defaultIssuerUrl,
      EXPO_PUBLIC_PID_REDIRECT_URI: redirectUri
    } = getEnv();

    /**
     * Check the passed credential type and throw an error if it's not found.
     */
    const state = listenerApi.getState();
    const credentialId = selectRequestedCredential(state);
    if (!credentialId) {
      throw new Error('Credential type not found');
    }

    // When the issuance originates from a credential offer, the issuer URL is
    // provided alongside the request and overrides the default EAA provider.
    const issuerUrl =
      selectRequestedCredentialIssuerUrl(state) ?? defaultIssuerUrl;
    // The whole resolved offer, when the issuance was started from one. It is
    // needed to validate the offer and to select the authorization server.
    const offer = selectRequestedCredentialOffer(state);
    // Checks if the wallet instance attestation needs to be requested
    if (shouldRequestWalletInstanceAttestationSelector(state)) {
      await listenerApi.dispatch(getWalletInstanceAttestationThunk());
    }

    // Gets the Wallet Instance Attestation from the persisted store
    const walletInstanceAttestation = selectWalletInstanceAttestationAsJwt(
      listenerApi.getState()
    );
    if (!walletInstanceAttestation) {
      throw new Error('Wallet Instance Attestation not found');
    }

    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    const credentialKeyTag = Crypto.randomUUID().toString();

    // Start the issuance flow
    const sessionId = selectSessionId(listenerApi.getState());
    const appFetch = createWalletFetch(sessionId);

    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const walletUnitAttestation = await listenerApi
      .dispatch(getWalletUnitAttestationThunk({ keyTags: [credentialKeyTag] }))
      .unwrap();
    const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

    const pid = selectCredential(wellKnownCredential.PID)(state);

    // When started from a credential offer, the authorization_code grant may
    // carry a specific authorization server (required when the Issuer relies on
    // more than one), as well as the `scope` and `issuer_state` that must be
    // forwarded to the PAR.
    const authorizationCodeGrant = offer
      ? wallet.CredentialsOffer.extractGrantDetails(offer)
          .authorizationCodeGrant
      : undefined;

    // Forwarded to the Issuer metadata discovery (fetchMetadata).
    const authorizationServer = authorizationCodeGrant?.authorizationServer;
    const offerScope = authorizationCodeGrant?.scope;
    const issuerState = authorizationCodeGrant?.issuerState;

    // Evaluate issuer trust
    const { issuerConf } = await wallet.CredentialIssuance.evaluateIssuerTrust(
      issuerUrl,
      {
        appFetch,
        authorizationServer
      }
    );

    // Validate the credential offer against the resolved Issuer metadata,
    // enforcing the authorization_server requirement for Issuers relying on
    // multiple authorization servers.
    if (offer) {
      await wallet.CredentialsOffer.validateCredentialOffer({
        offer,
        credentialIssuerMetadata: issuerConf.authorization_servers
          ? { authorization_servers: issuerConf.authorization_servers }
          : {}
      });
    }

    const { issuerRequestUri, clientId, codeVerifier } =
      await wallet.CredentialIssuance.startUserAuthorization(
        issuerConf,
        [credentialId],
        { proofType: 'none' },
        {
          walletInstanceAttestation,
          redirectUri,
          wiaCryptoContext,
          appFetch,
          scope: offerScope,
          issuerState
        }
      );

    // Extract the credential type from the config
    const credentialConfig =
      issuerConf.credential_configurations_supported[credentialId];
    const credentialType =
      credentialConfig.format === CredentialFormat.MDOC
        ? credentialConfig.scope
        : credentialConfig.vct;

    if (!credentialType) {
      throw new Error(
        `Error: The selected credential config doesn't have a credentialType`
      );
    }

    if (!pid || !pid.credential || !pid.keyTag) {
      throw new Error('PID required for EAA issuance but missing.');
    }

    const requestObject =
      await wallet.CredentialIssuance.getRequestedCredentialToBePresented(
        issuerRequestUri,
        clientId,
        issuerConf,
        appFetch
      );

    // Using only the PID credential
    const credentialsSdJwt = [
      ...Object.values([pid])
        .filter(c => c.format === 'dc+sd-jwt')
        .map(c => [c.keyTag, c.credential])
    ] as Array<[string, string]>;

    const evaluatedDcqlQuery =
      await wallet.RemotePresentation.evaluateDcqlQuery(
        requestObject.dcql_query as DcqlQuery,
        credentialsSdJwt
      );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(evaluatedDcqlQuery, [pid]);

    if (invalidCredentials.length > 0) {
      throw new Error(
        `No credential found for the required VC type: ${invalidCredentials}`
      );
    }

    // Add localization to the requested claims
    const presentationDetails = enrichPresentationDetails(evaluatedDcqlQuery, [
      pid
    ]);

    listenerApi.dispatch(
      setCredentialIssuancePreAuthSuccess({
        result: presentationDetails,
        credentialType
      })
    );
    await listenerApi.take(isAnyOf(setCredentialIssuancePostAuthRequest));

    // Complete the user authorization via form_post.jwt mode
    const { code } =
      await wallet.CredentialIssuance.completeUserAuthorizationWithFormPostJwtMode(
        requestObject,
        issuerConf,
        [pid.keyTag, pid.credential],
        { wiaCryptoContext, appFetch }
      );

    // Generate the DPoP context which will be used for the whole issuance flow
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
        dPopCryptoContext,
        appFetch
      }
    );

    // Obtain the credential
    // # TODO: WLEO-727 - rework to support multiple credentials issuance
    const { credential_configuration_id, credential_identifiers } =
      accessToken.authorization_details[0];

    // Obtain the credential
    const { credential, format } =
      await wallet.CredentialIssuance.obtainCredential(
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
          walletUnitAttestation: walletUnitAttestation.attestation,
          appFetch
        }
      );

    // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
    const { parsedCredential, expiration, issuedAt } =
      await wallet.CredentialIssuance.verifyAndParseCredential(
        issuerConf,
        credential,
        credential_configuration_id,
        { credentialCryptoContext, ignoreMissingAttributes: true }
      );

    listenerApi.dispatch(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          parsedCredential,
          credentialType,
          keyTag: credentialKeyTag,
          format,
          expiration: expiration.toISOString(),
          issuedAt: issuedAt?.toISOString(),
          issuerConf,
          spec_version: WALLET_SPEC_VERSION
        }
      })
    );
  } catch (error) {
    // Ignore if the task was aborted
    if (error instanceof TaskAbortError) {
      return;
    }
    // We put the error in both the pre and post auth status as we are unsure where the error occurred.
    const serialized = serializeErrorOrUnknown(error);
    listenerApi.dispatch(
      setCredentialIssuancePostAuthError({ error: serialized })
    );
    listenerApi.dispatch(
      setCredentialIssuancePreAuthError({ error: serialized })
    );
  }
};

/**
 * Listener to store the credential after pin validation.
 * It dispatches the action which shows the pin validation modal and awaits for the result.
 * If the pin is correct, the credential is stored, the issuance state is resetted and the user is navigated to the main screen.
 */
const addCredentialWithAuthListener: AppListenerWithAction<
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
    navigator.navigateWithReset('MAIN_TAB_NAV');
    IOToast.success(t('buttons.done', { ns: 'common' }));
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
