import {WalletInstanceAttestation} from '@pagopa/io-react-native-wallet';
/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param attestation - the Wallet Instance Attestation to validate
 * @returns true if the Wallet Instance Attestation is valid, false otherwise
 */
export const isWalletInstanceAttestationValid = (
  attestation: string
): boolean => {
  const {payload} = WalletInstanceAttestation.decode(attestation);
  const expiryDate = new Date(payload.exp * 1000);
  const now = new Date();
  return now < expiryDate;
};
