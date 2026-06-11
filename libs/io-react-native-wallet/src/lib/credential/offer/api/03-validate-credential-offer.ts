import { ValidateCredentialOfferOptions } from '@pagopa/io-wallet-oid4vci';
import type { CredentialOffer, ExtractGrantDetailsResult } from './types';

export interface ValidateCredentialOfferApi {
  /**
   * Extract grant details from a resolved Credential Offer.
   *
   * @param offer - A previously resolved {@link CredentialOffer}.
   * @returns The extracted {@link ExtractGrantDetailsResult} containing
   *   the grant type and its parameters.
   * @throws {InvalidCredentialOfferError} If no supported grant type is found.
   */
  validateCredentialOffer(options: {
    offer: ValidateCredentialOfferOptions['credentialOffer'];
    credentialIssuerMetadata: ValidateCredentialOfferOptions['credentialIssuerMetadata'];
  }): void;
}
