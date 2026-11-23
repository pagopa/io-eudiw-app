import {
  createClientAttestationPopJwt,
  createTokenDPoP,
  fetchTokenResponse
} from '@pagopa/io-wallet-oauth2';
import { v4 as uuidv4 } from 'uuid';

import type { IssuanceApi, TokenResponse } from '../api';

import {
  createSignJwtFromCryptoContext,
  partialCallbacks
} from '../../../utils/callbacks';
import { sdkConfigAPTITUDE } from '../../../utils/config';

export const authorizeAccess: IssuanceApi['authorizeAccess'] = async (
  issuerConf,
  accessTokenRequest,
  context
) => {
  const {
    appFetch = fetch,
    dPopCryptoContext,
    walletInstanceAttestation,
    wiaCryptoContext
  } = context;

  const tokenDPoP = await createTokenDPoP({
    callbacks: {
      ...partialCallbacks,
      signJwt: createSignJwtFromCryptoContext(dPopCryptoContext)
    },
    jti: uuidv4(),
    signer: {
      alg: 'ES256',
      method: 'jwk',
      publicJwk: await dPopCryptoContext.getPublicKey()
    },
    tokenRequest: {
      method: 'POST',
      url: issuerConf.token_endpoint
    }
  });

  const clientAttestationDPoP = await createClientAttestationPopJwt({
    authorizationServer: issuerConf.credential_issuer,
    callbacks: {
      generateRandom: partialCallbacks.generateRandom,
      signJwt: createSignJwtFromCryptoContext(wiaCryptoContext)
    },
    clientAttestation: walletInstanceAttestation,
    config: sdkConfigAPTITUDE,
    signer: {
      alg: 'ES256',
      method: 'jwk',
      publicJwk: await wiaCryptoContext.getPublicKey()
    }
  });

  const tokenResponse = await fetchTokenResponse({
    accessTokenEndpoint: issuerConf.token_endpoint,
    accessTokenRequest,
    callbacks: {
      ...partialCallbacks,
      fetch: appFetch
    },
    clientAttestationDPoP,
    config: sdkConfigAPTITUDE,
    dPoP: tokenDPoP.jwt,
    walletAttestation: walletInstanceAttestation
  });

  return {
    accessToken: tokenResponse as TokenResponse
  };
};
