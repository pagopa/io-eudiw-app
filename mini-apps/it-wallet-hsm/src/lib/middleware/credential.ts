import {
  raceEffect,
  regenerateCryptoKey,
  takeLatestEffect
} from '@io-eudiw-app/commons';
import { getEnv } from '@io-eudiw-app/env';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import { IOToast } from '@pagopa/io-app-design-system';
import { generate } from '@pagopa/io-react-native-crypto';
import {
  IoWallet,
  RemotePresentation,
  type Signer
} from '@pagopa/io-react-native-wallet';
import { AsyncThunk, isAnyOf, TaskAbortError } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import { t } from 'i18next';
import { serializeError } from 'serialize-error';

import { navigator } from '../navigation/utils';
import { WalletCombinedRootState } from '../store';
import {
  selectWalletInstanceAttestationAsJwt,
  shouldRequestWalletInstanceAttestationSelector
} from '../store/attestation';
import {
  resetCredentialIssuance,
  selectRequestedCredential,
  selectRequestedCredentialIssuerUrl,
  selectRequestedCredentialOffer,
  setCredentialIssuanceHsmPassword,
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthRequest,
  setCredentialIssuancePostAuthStep,
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
import {
  selectSessionId,
  setHsmPasswordRemainingAttempts,
  setRemoteKeyLocked
} from '../store/instance';
import { ResolvedCredentialOffer } from '../types';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { wellKnownCredential } from '../utils/credentials';
import {
  createCredentialSigner,
  createLocalSignerFor,
  DPOP_KEYTAG,
  WIA_KEYTAG
} from '../utils/crypto';
import { serializeErrorOrUnknown } from '../utils/errors';
import { enrichPresentationDetails } from '../utils/itwClaimsUtils';
import { getInvalidCredentials } from '../utils/itwCredentialStatusUtils';
import { CredentialsVault } from '../utils/itwCredentialVault';
import {
  CredentialFormat,
  StoredCredential,
  StoredCredentialMetadata
} from '../utils/itwTypesUtils';
import {
  createRemoteSignerFor,
  getHsmPasswordRemainingAttempts,
  isRemoteKeyLockedError
} from '../utils/remoteCrypto';
import {
  getKeyAttestationThunk,
  getWalletInstanceAttestationThunk
} from './attestation';
import { createAppAsyncThunk } from './thunk';
import { AppListener, AppListenerWithAction, AppStartListening } from './types';

type DcqlQuery = Parameters<
  RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']
>[0];

type EvaluatedDcqlQuery = Awaited<
  ReturnType<RemotePresentation.RemotePresentationApi['evaluateDcqlQuery']>
>;

type ResolveCredentialOfferThunk = AsyncThunk<
  ResolvedCredentialOffer,
  { url: string },
  {
    rejectValue: unknown;
    state: WalletCombinedRootState;
  }
>;

/**
 * Persists a credential bundle: writes the encoded SD-JWT/MDOC to the
 * vault first, and only on success commits the metadata to the Redux
 * slice. If the vault write fails, Redux is left untouched and the error
 * is propagated via `rejectWithValue` so the caller can surface it.
 */
export const persistCredential = createAppAsyncThunk<
  StoredCredentialMetadata,
  { credential: StoredCredential },
  { rejectValue: string }
>(
  'hsm/credentials/persist',
  async ({ credential }, { dispatch, rejectWithValue }) => {
    const { credential: encoded, ...metadata } = credential;
    try {
      await CredentialsVault.store(metadata.credentialType, encoded);
    } catch (error) {
      return rejectWithValue(JSON.stringify(serializeError(error)));
    }
    dispatch(addCredential({ credential: metadata }));
    return metadata;
  }
);
/**
 * Authorizes the presentation of the PID to the issuer.
 * A PID bound to a Remote WSCD key is authorized by the IT-Wallet password, which is asked again while it is wrong.
 * @param listenerApi - The listener API
 * @param pid - The PID to present
 * @param credentialsToPresent - The credentials to present, with their signers
 * @param present - Presents the credentials to the issuer
 * @returns the result of the presentation
 * @throws if the presentation fails or the Remote WSCD keys get locked
 */
const authorizePidPresentation = async <T>(
  listenerApi: AppListener,
  pid: StoredCredentialMetadata,
  credentialsToPresent: EvaluatedDcqlQuery,
  present: (items: EvaluatedDcqlQuery) => Promise<T>
): Promise<T> => {
  const { dispatch, getState, take } = listenerApi;
  if (!pid.remoteKey) {
    return present(credentialsToPresent);
  }
  const sessionId = selectSessionId(getState());
  for (;;) {
    const passwordAction = take(isAnyOf(setCredentialIssuanceHsmPassword));
    dispatch(setCredentialIssuancePostAuthStep('hsmPasswordRequired'));
    const [{ payload }] = await passwordAction;
    dispatch(setCredentialIssuancePostAuthStep('authorizing'));
    const signer = createRemoteSignerFor(
      pid.remoteKey,
      async () => payload.password,
      sessionId
    );
    try {
      const result = await present(
        credentialsToPresent.map(c => ({ ...c, signer }))
      );
      // A correct password resets the attempts
      dispatch(setHsmPasswordRemainingAttempts(undefined));
      return result;
    } catch (error) {
      const remainingAttempts = getHsmPasswordRemainingAttempts(error);
      if (remainingAttempts === undefined) {
        throw error;
      }
      dispatch(setHsmPasswordRemainingAttempts(remainingAttempts));
    }
  }
};

/* Thunk which resolves and validates a credential offer received via deep link
 * or QR code (OID4VCI, see the IT-Wallet credential offer flow). It supports
 * both by-value and by-reference offers and returns the issuer URL and the
 * first advertised credential configuration id, which are then used to drive
 * the regular issuance flow.
 * The `scope` is intentionally not handled at this stage.
 */
export const resolveCredentialOfferThunk: ResolveCredentialOfferThunk =
  createAppAsyncThunk<
    ResolvedCredentialOffer,
    { url: string },
    { rejectValue: unknown }
  >(
    'hsm/credentialIssuance/resolveOffer',
    async ({ url }, { getState, rejectWithValue }) => {
      try {
        const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });

        const offer = await wallet.CredentialsOffer.resolveCredentialOffer(url);

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
  // eslint-disable-next-line max-lines-per-function, complexity
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

    const wiaSigner = createLocalSignerFor(WIA_KEYTAG);

    const credentialKeyTag = Crypto.randomUUID().toString();

    // Start the issuance flow
    const sessionId = selectSessionId(listenerApi.getState());

    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    // Credential keys other than the PID one live in the device keystore
    await generate(credentialKeyTag);
    const credentialSigner = createLocalSignerFor(credentialKeyTag);
    const keyAttestation = await listenerApi
      .dispatch(
        getKeyAttestationThunk({
          keysToAttest: [{ signer: credentialSigner }]
        })
      )
      .unwrap();

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
        authorizationServer
      }
    );

    // Validate the credential offer against the resolved Issuer metadata,
    // enforcing the authorization_server requirement for Issuers relying on
    // multiple authorization servers.
    if (offer) {
      await wallet.CredentialsOffer.validateCredentialOffer({
        credentialIssuerMetadata: issuerConf.authorization_servers
          ? { authorization_servers: issuerConf.authorization_servers }
          : {},
        offer
      });
    }

    const { clientId, codeVerifier, issuerRequestUri } =
      await wallet.CredentialIssuance.startUserAuthorization(
        issuerConf,
        [credentialId],
        { proofType: 'none' },
        {
          issuerState,
          redirectUri,
          scope: offerScope,
          walletInstanceAttestation,
          wiaSigner
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

    if (!pid) {
      throw new Error('PID required for EAA issuance but missing.');
    }

    // Retrieve the encoded PID from the vault for the DCQL evaluation
    // and the user authorization step.
    const pidEncoded = await CredentialsVault.get(pid.credentialType);
    if (!pidEncoded) {
      throw new Error('PID encoded credential missing in vault.');
    }

    const requestObject =
      await wallet.CredentialIssuance.getRequestedCredentialToBePresented(
        issuerRequestUri,
        clientId,
        issuerConf
      );

    // Using only the PID credential
    const credentialsSdJwt: [Signer, string][] =
      pid.format === 'dc+sd-jwt' && pidEncoded
        ? [[createCredentialSigner(pid, sessionId), pidEncoded]]
        : [];

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
        credentialType,
        result: presentationDetails
      })
    );
    await listenerApi.take(isAnyOf(setCredentialIssuancePostAuthRequest));

    // Complete the user authorization via form_post.jwt mode
    const { code } = await authorizePidPresentation(
      listenerApi,
      pid,
      evaluatedDcqlQuery,
      credentialsToPresent =>
        wallet.CredentialIssuance.completeUserAuthorizationWithFormPostJwtMode(
          requestObject,
          issuerConf,
          credentialsToPresent,
          { wiaSigner }
        )
    );

    // Generate the DPoP context which will be used for the whole issuance flow
    await regenerateCryptoKey(DPOP_KEYTAG);
    const dPopSigner = createLocalSignerFor(DPOP_KEYTAG);

    const { accessToken } = await wallet.CredentialIssuance.authorizeAccess(
      issuerConf,
      code,
      redirectUri,
      codeVerifier,
      {
        dPopSigner,
        walletInstanceAttestation,
        wiaSigner
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
          credentialSigner,
          dPopSigner,
          keyAttestation: keyAttestation.attestation
        }
      );

    // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
    const { expiration, issuedAt, parsedCredential } =
      await wallet.CredentialIssuance.verifyAndParseCredential(
        issuerConf,
        credential,
        credential_configuration_id,
        { credentialSigner, ignoreMissingAttributes: true }
      );

    listenerApi.dispatch(
      setCredentialIssuancePostAuthSuccess({
        credential: {
          credential,
          credentialType,
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
    // Ignore if the task was aborted
    if (error instanceof TaskAbortError) {
      return;
    }
    // The third wrong IT-Wallet password locks the Remote WSCD keys, thus the identity must be confirmed again
    if (isRemoteKeyLockedError(error)) {
      listenerApi.dispatch(setRemoteKeyLocked());
      listenerApi.dispatch(resetCredentialIssuance());
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
    const persistResult = await listenerApi.dispatch(
      persistCredential(action.payload)
    );
    if (persistCredential.rejected.match(persistResult)) {
      listenerApi.dispatch(
        setCredentialIssuancePostAuthError({ error: persistResult.payload })
      );
      return;
    }
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
