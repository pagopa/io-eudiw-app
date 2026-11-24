import { Errors } from '@pagopa/io-react-native-wallet';
import crypto from 'crypto';

import {
  createRemoteSignerFor,
  enrollRemoteKey,
  type RemoteKey
} from '../remoteCrypto';

const mockPost = jest.fn();
let mockIsSignedByMaster = true;

jest.mock('@craftzdog/react-native-buffer', () => ({
  Buffer: jest.requireActual('buffer').Buffer
}));

jest.mock('@io-eudiw-app/env', () => ({
  getEnv: () => ({
    EXPO_PUBLIC_NSSAM_MASTER_PUBLIC_KEY: 'master-public-key',
    EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: 'https://wallet-provider.example'
  })
}));

jest.mock('@pagopa/io-react-native-jwt', () => ({ thumbprint: jest.fn() }));

jest.mock('@pagopa/io-react-native-wallet', () => {
  class WalletProviderResponseError extends Error {
    code: string;
    constructor({ code, message }: { code: string; message: string }) {
      super(message);
      this.code = code;
    }
  }
  return {
    Errors: {
      isWalletProviderResponseError: (error: unknown) =>
        error instanceof WalletProviderResponseError,
      WalletProviderResponseError,
      WalletProviderResponseErrorCodes: {
        WalletProviderGenericError: 'ERR_IO_WALLET_PROVIDER_GENERIC_ERROR'
      }
    },
    getWalletProviderClient: () => ({ post: mockPost })
  };
});

jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = jest.requireActual('crypto');
  return {
    createHash: nodeCrypto.createHash,
    // The NSSAM Master private key is not available to sign the test sessions
    createVerify: () => ({
      update() {
        return this;
      },
      verify: () => mockIsSignedByMaster
    }),
    randomBytes: nodeCrypto.randomBytes,
    webcrypto: {
      // Node exposes CryptoKey only as a global, untyped without the DOM lib
      CryptoKey: Reflect.get(globalThis, 'CryptoKey'),
      subtle: nodeCrypto.webcrypto.subtle
    }
  };
});

const xUserId = 'user-id';
const cancellation = {
  body: { jwtToken: 'jwt-token', sessionId: 'session-id' },
  header: { 'x-user-id': xUserId }
};

/** Answers like the Wallet Provider, with `operation` answering the NSSAM operation. */
const mockWalletProvider = (operation: () => Promise<unknown>) =>
  mockPost.mockImplementation(async (path: string, { body }) => {
    switch (path) {
      case '/auth/token-exchanges':
        return { access_token: 'jwt-token' };
      case '/remote-wscd/session-cancellations':
        return '';
      case '/remote-wscd/sessions': {
        const clientKey = await crypto.subtle.importKey(
          'jwk',
          {
            e: Buffer.from(body.clientPubKey.exponent, 'base64').toString(
              'base64url'
            ),
            kty: 'RSA',
            n: Buffer.from(body.clientPubKey.modulus, 'base64').toString(
              'base64url'
            )
          },
          { hash: 'SHA-256', name: 'RSA-OAEP' },
          false,
          ['encrypt']
        );
        const encryptionKey = await crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          clientKey,
          crypto.randomBytes(32)
        );
        return {
          encryptionKey: Buffer.from(encryptionKey).toString('base64'),
          sessionId: 'session-id',
          signature: 'c2lnbmF0dXJl'
        };
      }
      default:
        return operation();
    }
  });

const enrolledKey = (publicKey: object) => async () => ({
  encryptedKey: 'key-blob',
  kec: 'kec',
  publicKey
});

const p256Key = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const { x = '', y = '' } = p256Key.publicKey.export({ format: 'jwk' });
const remoteKey: RemoteKey = {
  encryptedKey: 'key-blob',
  kec: 'kec',
  publicKey: { crv: 'P-256', kty: 'EC', x, y }
};

beforeEach(() => {
  mockPost.mockReset();
  mockIsSignedByMaster = true;
});

describe('Remote WSCD sessions', () => {
  it('cancels the session when it fails before the operation', async () => {
    mockIsSignedByMaster = false;
    mockWalletProvider(enrolledKey({}));

    await expect(enrollRemoteKey('pin', xUserId)).rejects.toThrow(
      'The session key is not signed by the NSSAM Master key'
    );
    expect(mockPost).not.toHaveBeenCalledWith(
      '/remote-wscd/keys',
      expect.anything()
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/remote-wscd/session-cancellations',
      cancellation
    );
  });

  it.each([
    ['a network error', new TypeError('Network request failed')],
    [
      'a gateway error',
      new Errors.WalletProviderResponseError({
        code: 'ERR_IO_WALLET_PROVIDER_GENERIC_ERROR',
        message: 'Gateway Timeout',
        reason: {},
        statusCode: 504
      })
    ]
  ])(
    'cancels the session when the operation fails with %s',
    async (_, error) => {
      mockWalletProvider(() => Promise.reject(error));

      await expect(enrollRemoteKey('pin', xUserId)).rejects.toBe(error);
      expect(mockPost).toHaveBeenCalledWith(
        '/remote-wscd/session-cancellations',
        cancellation
      );
    }
  );

  it('does not cancel the session when the operation fails with a Remote WSCD problem', async () => {
    const error = new Errors.WalletProviderResponseError({
      code: 'PIN_INCORRECT',
      message: 'Wrong PIN',
      reason: {},
      statusCode: 403
    });
    mockWalletProvider(() => Promise.reject(error));

    await expect(enrollRemoteKey('pin', xUserId)).rejects.toBe(error);
    expect(mockPost).not.toHaveBeenCalledWith(
      '/remote-wscd/session-cancellations',
      expect.anything()
    );
  });
});

describe('enrollRemoteKey', () => {
  it('encodes the coordinates in the P-256 size', async () => {
    const expectedX = Buffer.alloc(32, 0xff);
    const expectedY = Buffer.concat([Buffer.alloc(1), Buffer.alloc(31, 0x01)]);
    mockWalletProvider(
      // Big-endian integers: a sign byte before X and no leading zero in Y
      enrolledKey({
        exponent: expectedY.subarray(1).toString('base64'),
        keyType: 'EC',
        modulus: Buffer.concat([Buffer.alloc(1), expectedX]).toString('base64')
      })
    );

    await expect(enrollRemoteKey('pin', xUserId)).resolves.toEqual({
      encryptedKey: 'key-blob',
      kec: 'kec',
      publicKey: {
        crv: 'P-256',
        kty: 'EC',
        x: expectedX.toString('base64url'),
        y: expectedY.toString('base64url')
      }
    });
  });

  it.each([
    ['an RSA key', { exponent: 'AQAB', keyType: 'RSA', modulus: 'AQID' }],
    [
      'a P-521 key',
      {
        exponent: Buffer.alloc(66, 0x01).toString('base64'),
        keyType: 'EC',
        modulus: Buffer.alloc(66, 0x01).toString('base64')
      }
    ]
  ])('rejects %s', async (_, publicKey) => {
    mockWalletProvider(enrolledKey(publicKey));

    await expect(enrollRemoteKey('pin', xUserId)).rejects.toThrow(
      'The Remote WSCD key is not an EC P-256 key'
    );
  });
});

describe('createRemoteSignerFor', () => {
  it('encodes the ES256 signature as DER', async () => {
    mockWalletProvider(async () => ({
      signature: crypto
        .sign('sha256', Buffer.from('value'), {
          dsaEncoding: 'ieee-p1363',
          key: p256Key.privateKey
        })
        .toString('base64')
    }));
    const signer = createRemoteSignerFor(remoteKey, async () => 'pin', xUserId);

    const signature = await signer.sign('value');

    expect(
      crypto.verify(
        'sha256',
        Buffer.from('value'),
        { dsaEncoding: 'der', key: p256Key.publicKey },
        Buffer.from(signature, 'base64')
      )
    ).toBe(true);
  });

  it('rejects a signature that is not ES256', async () => {
    mockWalletProvider(async () => ({
      signature: Buffer.alloc(132, 0x01).toString('base64')
    }));
    const signer = createRemoteSignerFor(remoteKey, async () => 'pin', xUserId);

    await expect(signer.sign('value')).rejects.toThrow(
      'The Remote WSCD signature is not an ES256 signature'
    );
  });
});
