import type {
  AuthorizeAccessContext,
  AuthorizeAccessTokenRequest,
  IssuerConfig
} from '../../api';

import { authorizeAccess } from '../04-authorize-access';

jest.mock('@pagopa/io-wallet-oauth2', () => ({
  ...jest.requireActual('@pagopa/io-wallet-oauth2'),
  createClientAttestationPopJwt: jest.fn().mockResolvedValue('client-proof'),
  createTokenDPoP: jest.fn().mockResolvedValue({ jwt: 'dpop-proof' })
}));

const issuerConf = {
  credential_issuer: 'https://issuer.example',
  token_endpoint: 'https://issuer.example/token'
} as IssuerConfig;
const cryptoContext = {
  getPublicKey: async () => ({ kty: 'EC' }),
  getSignature: async () => 'signature'
};
const token = { access_token: 'access-token', token_type: 'DPoP' };
const requestDetails = [
  { credential_configuration_id: 'student-card', type: 'openid_credential' }
] as const;
const responseDetails = [
  { ...requestDetails[0], credential_identifiers: ['student-card-dataset'] }
];

const requests = [
  {
    code: 'authorization-code',
    code_verifier: 'verifier',
    grant_type: 'authorization_code',
    redirect_uri: 'wallet://callback'
  },
  {
    grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
    'pre-authorized_code': 'pre-authorized-code'
  }
] satisfies AuthorizeAccessTokenRequest[];

const makeContext = (response: object) =>
  ({
    appFetch: jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(
        new Response(JSON.stringify(response), { status: 200 })
      ),
    dPopCryptoContext: cryptoContext,
    walletInstanceAttestation: 'wallet-attestation',
    wiaCryptoContext: cryptoContext
  }) satisfies AuthorizeAccessContext;

describe.each(requests)('authorizeAccess for $grant_type', request => {
  it('accepts a response without details when they were not requested', async () => {
    await expect(
      authorizeAccess(issuerConf, request, makeContext(token))
    ).resolves.toEqual({ accessToken: token });
  });

  it('returns required details when they were sent earlier', async () => {
    const { accessToken } = await authorizeAccess(issuerConf, request, {
      ...makeContext({ ...token, authorization_details: responseDetails }),
      authDetailsBound: true
    });
    expect(accessToken.authorization_details[0]).toEqual(responseDetails[0]);
  });

  it('rejects a missing or empty response field when details were sent earlier', async () => {
    await expect(
      authorizeAccess(issuerConf, request, {
        ...makeContext(token),
        authDetailsBound: true
      })
    ).rejects.toThrow('authorization_details');
    await expect(
      authorizeAccess(issuerConf, request, {
        ...makeContext({ ...token, authorization_details: [] }),
        authDetailsBound: true
      })
    ).rejects.toThrow('authorization_details');
  });

  it('sends details in the token request and requires them in the response', async () => {
    const tokenRequest = { ...request, authorization_details: requestDetails };
    const context = makeContext({
      ...token,
      authorization_details: responseDetails
    });
    await expect(
      authorizeAccess(issuerConf, tokenRequest, context)
    ).resolves.toEqual({
      accessToken: { ...token, authorization_details: responseDetails }
    });
    const body = new URLSearchParams(
      String(context.appFetch.mock.calls[0]?.[1]?.body)
    );
    expect(body.get('authorization_details')).toBe(
      JSON.stringify(requestDetails)
    );
    await expect(
      authorizeAccess(issuerConf, tokenRequest, makeContext(token))
    ).rejects.toThrow('authorization_details');
  });
});
