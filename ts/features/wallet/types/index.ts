import { Prettify } from '../../../types/utils';
import { ItwCredentialCard } from '../components/credential/ItwCredentialCard';

// Digital credential status
export type ItwJwtCredentialStatus = 'valid' | 'jwtExpired' | 'jwtExpiring';
// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | 'unknown'
  | 'valid'
  | 'invalid'
  | 'expiring'
  | 'expired'
  | ItwJwtCredentialStatus;

/**
 * Base type definition for all wallet cards.
 * Every card in the wallet must implement these essential properties
 * to ensure proper identification, categorization, and lifecycle management.
 */
type WalletCardBase = {
  /** Unique identifier used to track and reference individual cards */
  key: string;
  /**
   * Marks a card as hidden. Hidden cards are not displayed in the wallet UI
   * Useful when we need to remove card without deleting its data from the wallet
   */
  hidden?: true;
};

// IT Wallet
export type WalletCardItw = Prettify<
  {
    type: 'itw';
  } & ItwCredentialCard
>;

// This card type renders a loading skeleton, used as a placeholder for other cards
export type WalletCardPlaceholder = {
  type: 'placeholder';
};

// Base WalletCard type, which includes all card types
export type WalletCard = WalletCardBase & WalletCardItw;

// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard['type'];

export type CardColorScheme = 'default' | 'faded' | 'greyscale';

export interface FederationEntity {
  organization_name?: string;
  homepage_uri?: string;
  policy_uri?: string;
  logo_uri?: string;
  contacts?: Array<string>;
}
