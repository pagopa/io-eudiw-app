import * as z from 'zod';
import {ClaimDisplayFormat, ParsedCredential} from './types';
import {getClaimsFullLocale} from './locale';

/**
 * Constants to represent the type of the claim.
 * This can be later used to narrow the type of the claim parsed with {@link claimScheme}
 */
export const claimType = {
  date: 'date',
  drivingPrivileges: 'drivingPrivileges',
  verificationEvidence: 'verificationEvidence',
  string: 'string'
} as const;

/**
 * Schema to validate a string that represents a date.
 */
export const dateSchema = z
  .string()
  .date()
  .transform(str => ({
    value: new Date(str),
    type: claimType.date
  }));

/**
 * Schema to validate a string.
 */
export const stringSchema = z.string().transform(str => ({
  value: str,
  type: claimType.string
}));

/**
 * Schema to validate a verification evidence claim of the MDL
 */
export const verificationEvidenceSchema = z
  .object({
    organization_id: z.string(),
    organization_name: z.string(),
    country_code: z.string()
  })
  .transform(obj => ({
    value: obj,
    type: claimType.verificationEvidence
  }));

export type VerificationEvidenceType = z.infer<
  typeof verificationEvidenceSchema
>;

/**
 * schema to validate a dirving privileges claim of the MDL
 */
export const drivingPrivilegesSchema = z
  .array(
    z.object({
      issue_date: z.string().date(),
      expiry_date: z.string().date(),
      vehicle_category_code: z.string()
    })
  )
  .transform(arr => ({
    value: arr,
    type: claimType.drivingPrivileges
  }));

export type DrivingPrivilegesType = z.infer<typeof drivingPrivilegesSchema>;

/**
 * Schema to validate a claim which is a union of the previous defined schemas.
 */
export const claimScheme = z.union([
  dateSchema,
  drivingPrivilegesSchema,
  verificationEvidenceSchema,
  stringSchema
]);

export type ClaimScheme = z.infer<typeof claimScheme>;

/**
 * Parses the claims from the credential.
 * For each Record entry it maps the key and the attribute value to a label and a value.
 * The label is taken from the attribute name which is either a string or a record of locale and string.
 * If the type of the attribute name is string then when take it's value because locales have not been set.
 * If the type of the attribute name is record then we take the value of the locale that matches the current locale.
 * If there's no locale that matches the current locale then we take the attribute key as the name.
 * The value is taken from the attribute value.
 * @param parsedCredential - the parsed credential.
 * @returns the array of {@link ClaimDisplayFormat} of the credential contained in its configuration schema.
 */
export const parseClaims = (
  parsedCredential: ParsedCredential,
  options: {exclude?: Array<string>} = {}
): Array<ClaimDisplayFormat> => {
  const {exclude = []} = options;
  return Object.entries(parsedCredential)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, attribute]) => {
      const attributeName =
        typeof attribute.name === 'string'
          ? attribute.name
          : attribute.name?.[getClaimsFullLocale()] || key;

      return {label: attributeName, value: attribute.value, id: key};
    });
};
