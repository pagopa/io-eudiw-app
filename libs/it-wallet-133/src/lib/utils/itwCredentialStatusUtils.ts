import { differenceInCalendarDays } from 'date-fns';
import { wellKnownCredential } from './credentials';
import { getCredentialExpireDate } from './itwClaimsUtils';
import { validCredentialStatuses } from './itwCredentialUtils';
import { CredentialType } from './itwMocksUtils';
import {
  isDefined,
  ItwCredentialStatus,
  PresentationDetails,
  StoredCredential
} from './itwTypesUtils';

const DEFAULT_EXPIRING_DAYS = 30;

type GetCredentialStatusOptions = {
  /**
   * Number of days before expiration required to mark a credential as "EXPIRING".
   * @default 30
   */
  expiringDays?: number;
};

/**
 * Get the overall status of the credential, taking into account the status assertion,
 * the physical document's expiration date and the JWT's expiration date.
 * Overlapping statuses are handled according to a specific order (see `IO-WALLET-DR-0018`).
 *
 * @param storedCredential the stored credential
 * @param options see {@link GetCredentialStatusOptions}
 * @returns ItwCredentialStatus
 */
export const getCredentialStatus = (
  storedCredential: StoredCredential,
  options: GetCredentialStatusOptions = {}
): ItwCredentialStatus => {
  // NOTE: checks on status assertion have been removed because not yet supported

  const { expiringDays = DEFAULT_EXPIRING_DAYS } = options;
  const { parsedCredential, expiration } = storedCredential;

  const now = Date.now();

  const jwtExpireDays = differenceInCalendarDays(expiration, now);

  // Not all credentials have an expiration date
  const credentialExpireDate = getCredentialExpireDate(parsedCredential);
  const documentExpireDays = credentialExpireDate
    ? differenceInCalendarDays(credentialExpireDate, now)
    : NaN;

  if (documentExpireDays <= 0) {
    return 'expired';
  }

  if (jwtExpireDays <= 0) {
    return 'jwtExpired';
  }

  const isSameDayExpiring =
    documentExpireDays === jwtExpireDays && documentExpireDays <= expiringDays;

  // When both credentials are expiring the digital one wins unless they expire the same day
  if (jwtExpireDays <= expiringDays && !isSameDayExpiring) {
    return 'jwtExpiring';
  }

  if (documentExpireDays <= expiringDays) {
    return 'expiring';
  }

  return 'valid';
};

/**
 * Maps a vct name to the corresponding credential type, used in UI contexts
 * Note: although this list is unlikely to change, you should ensure to have
 * a fallback when dealing with this list to prevent unwanted behaviours
 */
const credentialTypesByVct: { [vct: string]: CredentialType } = {
  [wellKnownCredential.PID]: CredentialType.PID,
  [wellKnownCredential.DRIVING_LICENSE]: CredentialType.DRIVING_LICENSE,
  [wellKnownCredential.DISABILITY_CARD]: CredentialType.EUROPEAN_DISABILITY_CARD
};

/**
 * Return a list of credential types that have an invalid status.
 */
export const getInvalidCredentials = (
  presentationDetails: PresentationDetails,
  credentialsByType: Array<StoredCredential>
) =>
  presentationDetails
    // Retries the type from the VCT map
    .map(({ vct }) => (vct ? credentialTypesByVct[vct] : undefined))
    // Removes undefined
    .filter(isDefined)
    // Retrieve the credential using the type from the previous step
    .map(type => credentialsByType.find(c => c.credentialType === type))
    // Removes undefined
    .filter(isDefined)
    // Removes credential with valid statuses
    .filter(c => !validCredentialStatuses.includes(getCredentialStatus(c)))
    // Gets the invalid credential's type
    .map(c => c.credentialType);
