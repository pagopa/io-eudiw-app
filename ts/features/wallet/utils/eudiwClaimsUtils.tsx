import I18n from 'i18next';
import { differenceInCalendarDays, isValid } from 'date-fns';
import { truncate } from 'lodash';
import { ParsedCredential } from './types';
import { getClaimsFullLocale } from './locale';
import { IssuerConfiguration, StoredStatusAssertion } from './eudiwTypesUtils';

/**
 * CLAIMS MANIPULATION UTILS
 */

/**
 * Type for a stored credential.
 */
export type StoredCredentialEudiw = {
  keyTag: string;
  credential: string;
  format: string;
  parsedCredential: ParsedCredential;
  credentialType: string;
  credentialId: string;
  issuerConf: IssuerConfiguration; // The Wallet might still contain older credentials
  storedStatusAssertion?: StoredStatusAssertion;
  /**
   * The SD-JWT issuance and expiration dates in ISO format.
   * These might be different from the underlying document's dates.
   */
  // TODO: [SIW-2740] This type needs to be rafactored once mdoc format will be available
  jwt: {
    expiration: string;
    issuedAt?: string;
  };
};

export enum WellKnownClaim {
  unique_id = 'unique_id',
  expiry_date = 'expiry_date',
  link_qr_code = 'link_qr_code',
  content = 'content',
  tax_id_code = 'tax_id_code',
  document_number = 'document_number',
  given_name = 'given_name',
  family_name = 'family_name',
  portrait = 'portrait',
  driving_privileges = 'driving_privileges'
}

export type DisclosureClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

export type FlatClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

export type NestedArrayClaimDisplayFormat = {
  id: string;
  label: string;
  value: Array<ParsedCredential>;
};

export type ClaimDisplayFormat =
  | FlatClaimDisplayFormat
  | NestedArrayClaimDisplayFormat;

export const parseClaims = (
  parsedCredential: ParsedCredential,
  options: { exclude?: Array<string> } = {}
): Array<ClaimDisplayFormat> => {
  const { exclude = [] } = options;

  return Object.entries(parsedCredential)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, attribute]) => {
      const attributeName =
        typeof attribute.name === 'string'
          ? attribute.name
          : attribute.name?.[getClaimsFullLocale()] || key;

      return {
        id: key,
        label: attributeName,
        value: attribute.value
      };
    });
};

export const StringClaim = {
  is: (u: unknown): u is string => typeof u === 'string' && u.length > 0
};

export const SimpleDateFormat = {
  DDMMYYYY: 'DD/MM/YYYY',
  DDMMYY: 'DD/MM/YY'
} as const;

export type SimpleDateFormat =
  (typeof SimpleDateFormat)[keyof typeof SimpleDateFormat];

export class SimpleDate {
  constructor(
    private year: number,
    private month: number,
    private day: number
  ) {}

  toString(format: SimpleDateFormat = 'DD/MM/YYYY'): string {
    const dayString = this.day.toString().padStart(2, '0');
    const monthString = (this.month + 1).toString().padStart(2, '0');
    const yearString = this.year.toString();
    return format
      .replace('DD', dayString)
      .replace('MM', monthString)
      .replace('YYYY', yearString)
      .replace('YY', yearString.slice(-2));
  }

  toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }
  toDateWithoutTimezone(): Date {
    return new Date(Date.UTC(this.year, this.month, this.day));
  }
  getFullYear(): number {
    return this.year;
  }
  getMonth(): number {
    return this.month;
  }
  getDate(): number {
    return this.day;
  }

  static fromString(str: string): SimpleDate | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return null;
    }
    return new SimpleDate(
      +str.slice(0, 4),
      +str.slice(5, 7) - 1,
      +str.slice(8, 10)
    );
  }
}

export const SimpleDateClaim = {
  is: (u: unknown): u is SimpleDate => u instanceof SimpleDate
};

export const PlaceOfBirthClaim = {
  is: (u: any): u is { country: string; locality: string } =>
    u && typeof u.country === 'string' && typeof u.locality === 'string'
};

// TEST TYPE FOR DRIVING PRIVILEGES CLAIM ----------
export type DrivingPrivilegeClaimType = {
  driving_privilege: string;
  issue_date: SimpleDate;
  expiry_date: SimpleDate;
  restrictions_conditions: string | null;
};

export type DrivingPrivilegesClaimType = Array<DrivingPrivilegeClaimType>;

export type DrivingPrivilegesItemFlatRawType = {
  vehicle_category_code: string;
  issue_date: SimpleDate;
  expiry_date: SimpleDate;
};

export type DrivingPrivilegesFlatRawType =
  Array<DrivingPrivilegesItemFlatRawType>;

export const DrivingPrivilegesClaim = {
  is: (u: unknown): u is DrivingPrivilegesClaimType => {
    // eslint-disable-next-line functional/no-let
    let data = u;

    if (typeof u === 'string') {
      try {
        data = JSON.parse(u);
      } catch {
        return false;
      }
    }

    return (
      Array.isArray(data) && data.length > 0 && 'driving_privilege' in data[0]
    );
  }
};

export const DrivingPrivilegesFlatRaw = {
  is: (u: unknown): u is DrivingPrivilegesFlatRawType =>
    Array.isArray(u) && u.length > 0 && 'vehicle_category_code' in u[0]
};

export const DrivingPrivilegesCustomClaim = DrivingPrivilegesClaim;

export const ImageClaim = {
  is: (u: unknown): u is string =>
    typeof u === 'string' && /^data:image\/(png|jpg|jpeg|bmp);base64,/.test(u)
};

export const FiscalCodeClaim = {
  is: (u: unknown): u is string =>
    typeof u === 'string' && /TINIT-[A-Z0-9]{16}/.test(u)
};

export const NestedClaim = {
  is: (u: any): u is object => typeof u === 'object' && u !== null
};

export const ClaimValue = {
  decode: (u: unknown) => {
    // eslint-disable-next-line functional/no-let
    let finalValue = u;

    if (typeof u === 'string') {
      // Remove any accidental whitespace
      const cleanValue = u;
      // Check if it is a raw JPEG (starts with /9j/)
      if (cleanValue.startsWith('/9j/')) {
        finalValue = `data:image/jpeg;base64,${cleanValue}`;
      }
      // Check if it is a raw PNG (starts with iVBOR)
      else if (cleanValue.startsWith('iVBOR')) {
        finalValue = `data:image/png;base64,${cleanValue}`;
      }
      // Check if it is a raw BMP (starts with Qk)
      else if (cleanValue.startsWith('Qk')) {
        finalValue = `data:image/bmp;base64,${cleanValue}`;
      }
      // If it already has the header (data:image...), we leave it alone
    }

    return {
      _tag: 'Right',
      value: finalValue
    };
  }
};

export const getCredentialExpireDate = (
  credential: ParsedCredential
): Date | undefined => {
  const expireDate = credential['Claim.expiry_date'];
  if (!expireDate?.value) {
    return undefined;
  }

  const date = new Date(expireDate.value as string);
  return isValid(date) ? date : undefined;
};

export const getCredentialExpireDays = (
  credential: ParsedCredential
): number | undefined => {
  const expireDate = getCredentialExpireDate(credential);
  return expireDate === undefined
    ? undefined
    : differenceInCalendarDays(expireDate, Date.now());
};

const FISCAL_CODE_REGEX =
  /([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z])/g;

export const extractFiscalCode = (s: string): string | undefined => {
  const match = s.match(FISCAL_CODE_REGEX);
  return match ? match[0] : undefined;
};

export const getSafeText = (text: string) => truncate(text, { length: 128 });

export const isExpirationDateClaim = (claim: ClaimDisplayFormat) =>
  claim.id === WellKnownClaim.expiry_date;

export const extractClaim =
  <T = string,>(claimId: string) =>
  (credential: ParsedCredential): T | undefined => {
    const val = credential?.[claimId]?.value;
    return val as T | undefined;
  };

export const getFiscalCodeFromCredential = (
  credential: StoredCredentialEudiw | undefined
): string => {
  const raw = credential?.parsedCredential?.[WellKnownClaim.tax_id_code]?.value;
  if (typeof raw !== 'string') {
    return '';
  }
  return extractFiscalCode(raw) ?? '';
};

export const getFirstNameFromCredential = (
  credential: StoredCredentialEudiw | undefined
): string =>
  (credential?.parsedCredential?.[WellKnownClaim.given_name]
    ?.value as string) ?? '';

export const getFamilyNameFromCredential = (
  credential: StoredCredentialEudiw | undefined
): string =>
  (credential?.parsedCredential?.[WellKnownClaim.family_name]
    ?.value as string) ?? '';

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> => {
  const decoded = claim.value;

  if (decoded === null || decoded === undefined) {
    return I18n.t('features.itWallet.generic.placeholders.claimNotAvailable');
  }

  if (PlaceOfBirthClaim.is(decoded)) {
    return `${decoded.locality} (${decoded.country})`;
  }
  if (SimpleDateClaim.is(decoded)) {
    return decoded.toString();
  }
  if (ImageClaim.is(decoded)) {
    return decoded;
  }
  if (DrivingPrivilegesClaim.is(decoded)) {
    return decoded.map((e: any) => e.driving_privilege);
  }
  if (FiscalCodeClaim.is(decoded)) {
    return extractFiscalCode(decoded) ?? decoded;
  }
  if (typeof decoded === 'boolean') {
    return I18n.t(
      `features.itWallet.presentation.credentialDetails.boolClaim.${decoded}`
    );
  }

  if (typeof decoded === 'string' || Array.isArray(decoded)) {
    return decoded as string | Array<string>;
  }

  return I18n.t('features.itWallet.generic.placeholders.claimNotAvailable');
};
