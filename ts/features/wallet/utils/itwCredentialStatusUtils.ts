import { differenceInCalendarDays } from "date-fns";
import { getCredentialExpireDate } from "./itwClaimsUtils";
import {
  ItwCredentialStatus
} from "./itwTypesUtils";
import { StoredCredential } from "./types";

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
  const {
    parsedCredential,
    expiration
  } = storedCredential;

  const now = Date.now();

  const jwtExpireDays = differenceInCalendarDays(expiration, now);

  // Not all credentials have an expiration date
  const credentialExpireDate = getCredentialExpireDate(parsedCredential);
  const documentExpireDays = credentialExpireDate ? differenceInCalendarDays(credentialExpireDate, now) : NaN;


  if (documentExpireDays <= 0) {
    return "expired";
  }

  if (jwtExpireDays <= 0) {
    return "jwtExpired";
  }

  const isSameDayExpiring =
    documentExpireDays === jwtExpireDays && documentExpireDays <= expiringDays;

  // When both credentials are expiring the digital one wins unless they expire the same day
  if (jwtExpireDays <= expiringDays && !isSameDayExpiring) {
    return "jwtExpiring";
  }

  if (documentExpireDays <= expiringDays) {
    return "expiring";
  }

  return "valid";
};
