import { ioWalletApiByVersion } from '@pagopa/io-react-native-wallet';

import { ItwCredentialCard } from '../components/credential/ItwCredentialCard';
import { Prettify } from '../utils/itwTypesUtils';

export type CardColorScheme = 'default' | 'faded' | 'greyscale';
export interface FederationEntity {
  contacts?: string[];
  homepage_uri?: string;
  logo_uri?: string;
  organization_name?: string;
  policy_uri?: string;
}

// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | 'expired'
  | 'expiring'
  | 'invalid'
  | 'unknown'
  | 'valid'
  | ItwJwtCredentialStatus;

// Digital credential status
export type ItwJwtCredentialStatus = 'jwtExpired' | 'jwtExpiring' | 'valid';

/**
 * Type alias of `io-react-native-wallet`'s CredentialOffer
 */
export type ResolvedCredentialOffer = Awaited<
  ReturnType<
    (typeof ioWalletApiByVersion)['1.3.3']['CredentialsOffer']['resolveCredentialOffer']
  >
>;

// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase & WalletCardItw;

// IT Wallet
export type WalletCardItw = Prettify<
  ItwCredentialCard & {
    type: 'itw';
  }
>;

/**
 * Base type definition for all wallet cards.
 * Every card in the wallet must implement these essential properties
 * to ensure proper identification, categorization, and lifecycle management.
 */
type WalletCardBase = {
  /**
   * Marks a card as hidden. Hidden cards are not displayed in the wallet UI
   * Useful when we need to remove card without deleting its data from the wallet
   */
  hidden?: true;
  /** Unique identifier used to track and reference individual cards */
  key: string;
};
