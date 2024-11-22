import {generate, getPublicKey, sign} from '@pagopa/io-react-native-crypto';
import uuid from 'react-native-uuid';
import {
  fixBase64EncodingOnKey,
  type IntegrityContext
} from '@pagopa/io-react-native-wallet';
import {encode} from 'js-base64';

/**
 * Type returned by the getHardwareSignatureWithAuthData function of {@link IntegrityContext}.
 * It contains the signature and the authenticator data.
 */
export type HardwareSignatureWithAuthData = {
  signature: string;
  authenticatorData: string;
};

/**
 * Const defined for parameters which are not needed in this implementation but are required from  {@link io-react-native-wallet} interfaces.
 * Mostly because integrity is not really implemented in this project.
 */
const NOT_NEEDED = 'NOT_NEEDED';

/**
 * Generates the hardware signature with the authentication data. The implementation differs between iOS and Android.
 * This will later be used to verify the signature on the server side.
 * @param hardwareKeyTag - the hardware key tag to use for the signature.
 * @returns a function that takes the client data as string and returns a promise that resolves with the signature and the authenticator data or rejects with an error.
 */
const getHardwareSignatureWithAuthData = async (
  hardwareKeyTag: string,
  clientData: string
): Promise<HardwareSignatureWithAuthData> => {
  /**
   * Client data should be hashed however it is not done in this implementation.
   */
  const signature = await sign(clientData, hardwareKeyTag);
  return {signature, authenticatorData: NOT_NEEDED};
};

/**
 * Generates the hardware backed key for the current platform. iOS or Android are supported.
 * @returns a promise that resolves with the key tag as string or rejects with an error.
 */
const generateIntegrityHardwareKeyTag = async () => {
  const keyTag = uuid.v4().toString();
  await generate(keyTag);
  return keyTag;
};

/**
 * Ensures that the hardwareKeyTag as padding added before calling {@link getAttestationIntegrity}
 */
const getAttestation = async (
  _: string,
  hardwareKeyTag: string
): Promise<string> => {
  const pk = await getPublicKey(hardwareKeyTag);
  const fixedPk = fixBase64EncodingOnKey(pk);
  return encode(JSON.stringify(fixedPk));
};

const getIntegrityContext = (hardwareKeyTag: string): IntegrityContext => ({
  getHardwareKeyTag: () => hardwareKeyTag,
  getAttestation: (nonce: string) => getAttestation(nonce, hardwareKeyTag),
  getHardwareSignatureWithAuthData: clientData =>
    getHardwareSignatureWithAuthData(hardwareKeyTag, clientData)
});

export {generateIntegrityHardwareKeyTag, getIntegrityContext};
