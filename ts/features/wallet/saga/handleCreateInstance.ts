import {call, put, select} from 'typed-redux-saga';
import Config from 'react-native-config';
import {
  createCryptoContextFor,
  Credential,
  Errors,
  WalletInstance
} from '@pagopa/io-react-native-wallet';
import {generate} from '@pagopa/io-react-native-crypto';
import uuid from 'react-native-uuid';
import {CryptoContext} from '@pagopa/io-react-native-jwt';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import {setAttestation} from '../store/attestation';
import {selectSessionId} from '../../../store/reducers/preferences';
import {selectInstanceKeyTag, setInstanceKeyTag} from '../store/instance';
import {createWalletProviderFetch} from '../utils/fetch';
import {
  setPidIssuanceFirstFlowError,
  setPidIssuanceFirstFlowSuccess
} from '../store/pidIssuance';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {DPOP_KEYTAG, WIA_KEYTAG} from '../utils/crypto';
import {getAttestation} from './handleGetAttestation';

/**
 * Saga which handles the creation of a wallet instance.
 * If a wallet instance already exists, it will use the existing instance key tag.
 * It then fetches a wallet attestation to check if the instance is valid.
 * If the attestation is valid then it is set in the store.
 * However, if the attestation returns an error which indicates that the instance has been revoked (403) or not found (404),
 * then it will create a new instance and obtain a new attestation.
 * If a wallet instance doesn't exists then it will create a new instance and obtain a new attestation.
 */
export function* handleCreateInstance() {
  try {
    console.log('ao sono qua invece');
    // const existingInstanceKeyTag = yield* select(selectInstanceKeyTag);

    // if (existingInstanceKeyTag) {
    //   // Instance exists, try to get an attestation
    //   try {
    //     const attestation = yield* call(getAttestation, existingInstanceKeyTag);
    //     yield* put(setAttestation(attestation));
    //     // yield* put(setInstanceSuccess());
    //     // return;
    //   } catch (e) {
    //     // An error occurred while obtaining an attestation
    //     const err = e as Errors.WalletProviderResponseError;
    //     if (
    //       err.code !== 'ERR_IO_WALLET_INSTANCE_REVOKED' &&
    //       err.code !== 'ERR_IO_WALLET_INSTANCE_NOT_FOUND'
    //     ) {
    //       // If the error is not related to the instance being revoked or not found, re-throw the error
    //       throw err;
    //     }
    //   }
    // }
    // Create a new instance if none exists or the existing instance is revoked or not found
    const keyTag = yield* call(createInstance);
    const attestation = yield* call(getAttestation, keyTag);
    yield* put(setInstanceKeyTag(keyTag));
    yield* put(setAttestation(attestation));

    yield* call(obtainPid, attestation, createCryptoContextFor(WIA_KEYTAG));

    // Reset the credential state before obtaining a new PID
    // dispatch(credentialReset());
  } catch (err: unknown) {
    yield* put(setPidIssuanceFirstFlowError({error: JSON.stringify(err)}));
  }
}

/**
 * Utility generator function to create a new wallet instance.
 * @returns the keytag used to create the wallet instance.
 */
export function* createInstance() {
  const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
  const sessionId = yield* select(selectSessionId);
  const appFetch = createWalletProviderFetch(walletProviderBaseUrl, sessionId);
  const keyTag = yield* call(generateIntegrityHardwareKeyTag);
  const integrityContext = getIntegrityContext(keyTag);

  yield* call(WalletInstance.createWalletInstance, {
    integrityContext,
    walletProviderBaseUrl,
    appFetch
  });
  return keyTag;
}

export function* obtainPid(
  walletInstanceAttestation: string,
  wiaCryptoContext: CryptoContext
) {
  const {
    PID_PROVIDER_BASE_URL,
    PID_REDIRECT_URI: redirectUri,
    PID_IDP_HINT: idpHint
  } = Config;

  // Start the issuance flow
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: PID_PROVIDER_BASE_URL,
    credentialType: 'PersonIdentificationData'
  });

  const {issuerUrl, credentialType} = startFlow();

  // Evaluate issuer trust
  const {issuerConf} = yield* call(
    Credential.Issuance.evaluateIssuerTrust,
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

  // Obtain the Authorization URL
  const {authUrl} = yield* call(
    Credential.Issuance.buildAuthorizationUrl,
    issuerRequestUri,
    clientId,
    issuerConf,
    idpHint
  );

  console.log('ao so qua');

  console.log(authUrl);

  yield* put(setPidIssuanceFirstFlowSuccess({authUrl}));

  // const supportsCustomTabs = yield* call(supportsInAppBrowser);
  // if (!supportsCustomTabs) {
  //   throw new Error('Custom tabs are not supported');
  // }

  // // Open the authorization URL in the custom tab
  // const authRedirectUrl = yield* call(
  //   openAuthenticationSession,
  //   authUrl,
  //   redirectUri
  // );

  // const {code} = yield* call(
  //   Credential.Issuance.completeUserAuthorizationWithQueryMode,
  //   authRedirectUrl
  // );

  // // Create credential crypto context
  // const credentialKeyTag = uuid.v4().toString();
  // yield* call(generate, credentialKeyTag);
  // const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  // // Create DPoP context for the whole issuance flow
  // yield* call(regenerateCryptoKey, DPOP_KEYTAG);
  // const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // const {accessToken} = yield* call(
  //   Credential.Issuance.authorizeAccess,
  //   issuerConf,
  //   code,
  //   clientId,
  //   redirectUri,
  //   codeVerifier,
  //   {
  //     walletInstanceAttestation,
  //     wiaCryptoContext,
  //     dPopCryptoContext
  //   }
  // );

  // const {credential, format} = yield* call(
  //   Credential.Issuance.obtainCredential,
  //   issuerConf,
  //   accessToken,
  //   clientId,
  //   credentialDefinition,
  //   {
  //     credentialCryptoContext,
  //     dPopCryptoContext
  //   }
  // );

  // const {parsedCredential} = yield* call(
  //   Credential.Issuance.verifyAndParseCredential,
  //   issuerConf,
  //   credential,
  //   format,
  //   {credentialCryptoContext}
  // );

  // console.log(parsedCredential);

  // return {
  //   parsedCredential,
  //   credential,
  //   keyTag: credentialKeyTag,
  //   credentialType
  // };
}
