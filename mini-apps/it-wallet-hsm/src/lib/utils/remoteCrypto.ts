import { Buffer } from '@craftzdog/react-native-buffer';
import { getEnv } from '@io-eudiw-app/env';
import { thumbprint } from '@pagopa/io-react-native-jwt';
import {
  Errors,
  getWalletProviderClient,
  type Signer
} from '@pagopa/io-react-native-wallet';
import QuickCrypto from 'react-native-quick-crypto';

/** DER prefix of a SHA-256 DigestInfo, which NSSAM `hashsign` expects before the digest. */
const SHA256_DIGEST_INFO_PREFIX = '3031300d060960864801650304020105000420';

/** Size in bytes of a P-256 coordinate and of the `r` and `s` values of an ES256 signature. */
const P256_SIZE = 32;

/**
 * A key pair enrolled on the Remote WSCD. It is serializable and can be persisted along with the credential it is bound to.
 */
export type RemoteKey = {
  /** The KeyBlob of the private key, encrypted by the HSM: it must be sent with every signature. */
  encryptedKey: string;
  /** The Key Enrollment Certificate, which attests the key in Key Attestation requests. */
  kec: string;
  publicKey: { crv: 'P-256'; kty: 'EC'; x: string; y: string };
};

/**
 * Enrolls a new EC P-256 key pair on the Remote WSCD through the Wallet Provider.
 * The returned key must be persisted to sign with {@link createRemoteSignerFor}.
 * @param pin - The Remote WSCD PIN of the user
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @returns the enrolled key
 */
export const enrollRemoteKey = async (
  pin: string,
  xUserId: string
): Promise<RemoteKey> => {
  const { encryptedKey, kec, publicKey } = await withSession(
    xUserId,
    accessToken => enrollRequest(accessToken, pin),
    ({ api, header, session }) =>
      api.post('/remote-wscd/keys', { body: session, header })
  );
  // NSSAM generates EC keys on the curve configured on the HSM, P-521 by default, while only P-256 keys can be attested
  if (publicKey.keyType !== 'EC') {
    throw new Error('The Remote WSCD key is not an EC P-256 key');
  }

  return {
    encryptedKey,
    kec,
    // The Wallet Provider returns the EC coordinates X and Y in `modulus` and `exponent`
    publicKey: {
      crv: 'P-256',
      kty: 'EC',
      x: toP256Coordinate(publicKey.modulus),
      y: toP256Coordinate(publicKey.exponent)
    }
  };
};

/**
 * Changes the PIN of a key enrolled on the Remote WSCD through the Wallet Provider.
 * The returned key replaces the given one, whose KeyBlob is no longer accepted.
 * @param remoteKey - The enrolled key
 * @param pin - The current Remote WSCD PIN
 * @param newPin - The new Remote WSCD PIN
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @returns the key with the new KeyBlob
 */
export const changeRemoteKeyPin = async (
  remoteKey: RemoteKey,
  pin: string,
  newPin: string,
  xUserId: string
): Promise<RemoteKey> => {
  const { encryptedKey } = await withSession(
    xUserId,
    accessToken => changePinRequest(accessToken, pin, newPin),
    ({ api, header, session }) =>
      api.post('/remote-wscd/pin-changes', {
        body: { ...session, encryptedKey: remoteKey.encryptedKey },
        header
      })
  );

  return { ...remoteKey, encryptedKey };
};

/**
 * Creates a {@link Signer} bound to a key enrolled on the Remote WSCD with {@link enrollRemoteKey}.
 * The PIN is requested lazily, only when a signature is needed, and then reused for the lifetime of the signer.
 * @param remoteKey - The enrolled key
 * @param getPin - Returns the Remote WSCD PIN of the user, required by every signature
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @returns the signer
 */
export const createRemoteSignerFor = (
  remoteKey: RemoteKey,
  getPin: () => Promise<string>,
  xUserId: string
): Signer => {
  let pinPromise: Promise<string> | undefined;
  const pin = () => (pinPromise ??= getPin());

  return {
    getPublicKey: async () => ({
      ...remoteKey.publicKey,
      kid: await thumbprint(remoteKey.publicKey)
    }),
    kind: 'REMOTE',
    sign: async value => {
      const digestInfo = Buffer.concat([
        Buffer.from(SHA256_DIGEST_INFO_PREFIX, 'hex'),
        QuickCrypto.createHash('sha256').update(value, 'utf8').digest()
      ]).toString('base64');

      const currentPin = await pin();
      const { signature } = await withSession(
        xUserId,
        accessToken => hashSignRequest(accessToken, currentPin, digestInfo),
        ({ api, header, session }) =>
          api.post('/remote-wscd/signatures', {
            body: { ...session, encryptedKey: remoteKey.encryptedKey },
            header
          })
      );

      return rawSignatureToDer(Buffer.from(signature, 'base64'));
    }
  };
};

/**
 * Runs an NSSAM operation in a new session opened through the Wallet Provider, encrypting its request with the session key.
 * NSSAM limits the open sessions of each user, so the session is cancelled when the operation does not consume it.
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @param request - Builds the NSSAM request of the operation, which is sent encrypted in the session `data`
 * @param operation - Sends the session to the Wallet Provider endpoint of the operation
 * @returns the result of the operation
 */
const withSession = async <T>(
  xUserId: string,
  request: (accessToken: string) => object,
  operation: (context: {
    api: ReturnType<typeof getWalletProviderClient>;
    header: { 'x-user-id': string };
    session: { data: string; jwtToken: string; sessionId: string };
  }) => Promise<T>
): Promise<T> => {
  const api = getWalletProviderClient({
    walletProviderBaseUrl: getEnv().EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL
  });
  const header = { 'x-user-id': xUserId };

  const { access_token: jwtToken } = await api.post('/auth/token-exchanges', {
    header
  });

  const { CryptoKey, subtle } = QuickCrypto.webcrypto;

  const keyPair = await subtle.generateKey(
    {
      hash: 'SHA-256',
      modulusLength: 3072,
      name: 'RSA-OAEP',
      publicExponent: new Uint8Array([1, 0, 1])
    },
    true,
    ['encrypt', 'decrypt']
  );
  if (
    !('privateKey' in keyPair) ||
    !(keyPair.privateKey instanceof CryptoKey) ||
    !(keyPair.publicKey instanceof CryptoKey)
  ) {
    throw new Error('Unable to generate the session key pair');
  }
  const jwk = await subtle.exportKey('jwk', keyPair.publicKey);
  if (jwk instanceof ArrayBuffer || !jwk.e || !jwk.n) {
    throw new Error('Unable to export the session public key');
  }

  const { encryptionKey, sessionId, signature } = await api.post(
    '/remote-wscd/sessions',
    {
      body: {
        clientPubKey: {
          exponent: Buffer.from(jwk.e, 'base64url').toString('base64'),
          modulus: Buffer.from(jwk.n, 'base64url').toString('base64')
        },
        jwtToken
      },
      header
    }
  );

  try {
    // NSSAM signs the first n bytes of the base64 `encryptionKey`, where n is the length of the decoded key
    const encryptedSessionKey = Buffer.from(encryptionKey, 'base64');
    const isSignedByMaster = QuickCrypto.createVerify('SHA256')
      .update(
        Buffer.from(encryptionKey, 'utf8').subarray(
          0,
          encryptedSessionKey.length
        )
      )
      .verify(
        { format: 'pem', key: getEnv().EXPO_PUBLIC_NSSAM_MASTER_PUBLIC_KEY },
        Buffer.from(signature, 'base64')
      );
    if (!isSignedByMaster) {
      throw new Error('The session key is not signed by the NSSAM Master key');
    }

    const rawSessionKey = await subtle.decrypt(
      { name: 'RSA-OAEP' },
      keyPair.privateKey,
      encryptedSessionKey
    );
    // AES-256-GCM is required: a shorter key would silently downgrade to AES-128/192
    if (rawSessionKey.byteLength !== 32) {
      throw new Error('The session key is not an AES-256 key');
    }
    const sessionKey = await subtle.importKey(
      'raw',
      rawSessionKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = QuickCrypto.randomBytes(16);
    const encryptedRequest = await subtle.encrypt(
      { iv, name: 'AES-GCM' },
      sessionKey,
      Buffer.from(JSON.stringify(request(jwtToken)))
    );

    // NSSAM format: ivLength || tagLength || iv || ciphertext || tag
    const data = Buffer.concat([
      Buffer.from([16, 16]),
      iv,
      Buffer.from(encryptedRequest)
    ]).toString('base64');

    return await operation({
      api,
      header,
      session: { data, jwtToken, sessionId }
    });
  } catch (error) {
    // A Remote WSCD problem is answered only after NSSAM consumed the session or the Wallet Provider cancelled it
    if (!isRemoteWscdError(error)) {
      void api
        .post('/remote-wscd/session-cancellations', {
          body: { jwtToken, sessionId },
          header
        })
        .catch(() => undefined);
    }
    throw error;
  }
};

/**
 * Whether the error is a Remote WSCD problem answered by the Wallet Provider, e.g. `PIN_INCORRECT`.
 * Other failures, such as network or gateway errors, do not tell whether the request reached NSSAM.
 */
const isRemoteWscdError = (error: unknown) =>
  Errors.isWalletProviderResponseError(error) &&
  error.code !==
    Errors.WalletProviderResponseErrorCodes.WalletProviderGenericError;

/* eslint-disable perfectionist/sort-objects -- NSSAM rejects requests whose fields are not in this order */
const enrollRequest = (accessToken: string, pin: string) => ({
  cmd: 192,
  access_token: accessToken,
  pin,
  keyType: 1 // EC
});

const hashSignRequest = (
  accessToken: string,
  pin: string,
  digestInfo: string
) => ({
  cmd: 193,
  access_token: accessToken,
  pin,
  digest_info: digestInfo
});

const changePinRequest = (
  accessToken: string,
  pin: string,
  newPin: string
) => ({
  cmd: 194,
  access_token: accessToken,
  pin,
  new_pin: newPin
});
/* eslint-enable perfectionist/sort-objects */

/**
 * Encodes a big-endian EC coordinate as a P-256 JWK coordinate, which is exactly 32 bytes long.
 * @throws if the coordinate does not fit a P-256 key
 */
const toP256Coordinate = (coordinate: string) => {
  const value = stripLeadingZeros(Buffer.from(coordinate, 'base64'));
  if (value.length > P256_SIZE) {
    throw new Error('The Remote WSCD key is not an EC P-256 key');
  }
  return Buffer.concat([
    Buffer.alloc(P256_SIZE - value.length),
    value
  ]).toString('base64url');
};

/**
 * Encodes the raw `r || s` ES256 signature returned by NSSAM as DER, as required by {@link Signer}.
 * @throws if the signature is not an ES256 signature
 */
const rawSignatureToDer = (signature: Buffer) => {
  // Also guarantees that every DER length below fits the short form
  if (signature.length !== 2 * P256_SIZE) {
    throw new Error('The Remote WSCD signature is not an ES256 signature');
  }
  const toDerInteger = (value: Buffer) => {
    const unsigned = stripLeadingZeros(value);
    // A leading zero keeps the integer positive when its most significant bit is set
    const integer =
      unsigned.readUInt8(0) >= 0x80
        ? Buffer.concat([Buffer.from([0]), unsigned])
        : unsigned;
    return Buffer.concat([Buffer.from([0x02, integer.length]), integer]);
  };
  const r = toDerInteger(signature.subarray(0, P256_SIZE));
  const s = toDerInteger(signature.subarray(P256_SIZE));

  return Buffer.concat([
    Buffer.from([0x30, r.length + s.length]),
    r,
    s
  ]).toString('base64');
};

/**
 * Strips the leading zeros of a big-endian integer, keeping at least one byte.
 */
const stripLeadingZeros = (value: Buffer) => {
  const firstNonZero = value.findIndex(byte => byte !== 0);
  return value.subarray(firstNonZero === -1 ? value.length - 1 : firstNonZero);
};
