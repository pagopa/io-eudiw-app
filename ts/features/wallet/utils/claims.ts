import * as z from 'zod';
import { ClaimDisplayFormat, ParsedCredential } from './types';
import { getClaimsFullLocale } from './locale';

/**
 * Constants to represent the type of the claim.
 * This can be later used to narrow the type of the claim parsed with {@link claimScheme}
 */
export const claimType = {
  date: 'date',
  expireDate: 'expireDate',
  drivingPrivileges: 'drivingPrivileges',
  verificationEvidence: 'verificationEvidence',
  string: 'string',
  emptyString: 'emptyString',
  boolean: 'boolean',
  image: 'image',
  pdf: 'application/pdf',
  stringArray: 'stringArray',
  placeOfBirth: 'placeOfBirth'
} as const;

/**
 * Schema that represents a generic claim structure, used to pipe generic conversion behavior
 */
const baseClaimSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.unknown()
});

/**
 * {@link baseClaimSchema} transformation extracting the value property from the schema to allow pipelining
 */
const baseClaimSchemaExtracted = baseClaimSchema.transform(
  baseClaim => baseClaim.value
);

/**
 * Schema to validate a string that represents a date when the base claim label is not specified.
 */
export const dateSchema = z
  .string()
  .date()
  .transform(str => ({
    value: new Date(str),
    type: claimType.date
  }));

/**
 * Schema to validate a string when the base claim label is not specified.
 */
export const stringSchema = z.string().transform(str => ({
  value: str,
  type: claimType.string
}));

/**
 * Schema to validate an empty string
 */
export const emptyStringSchema = z
  .string()
  .refine(str => str === '')
  .transform(str => ({
    value: str,
    type: claimType.emptyString
  }));

/**
 * Schema to validate an array of strings when the base claim label is not specified.
 */
export const stringArraySchema = z
  .string()
  .array()
  .transform(array => ({
    value: array,
    type: claimType.stringArray
  }));

/**
 * Schema to validate a boolean when the base claim label is not specified
 */
export const booleanSchema = z.boolean().transform(bool => ({
  value: bool,
  type: claimType.boolean
}));

/**
 * Schema to validate a number when the base claim label is not specified
 */
export const numberSchema = z.number().transform(num => ({
  value: String(num),
  type: claimType.string
}));

/**
 * Schema to validate a verification evidence claim of the MDL when the base claim label is not specified
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

export type VerificationEvidenceClaimType = z.infer<
  typeof verificationEvidenceSchema
>;

/**
 * Schema to validate a dirving privileges claim of the MDL when the base claim label is not specified
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

export type DrivingPrivilegesClaimType = z.infer<
  typeof drivingPrivilegesSchema
>;

/**
 * These bytes represent the possible kinds of SOF segments, which contain the image's proportions,
 * that can be found within a JPEG file, see https://www.w3.org/Graphics/JPEG/itu-t81.pdf, page 32
 */
const JPEG_SOF_CODES = [
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
  0xcf
];

/**
 * Schema to validate claims that are known to have a base64url representation of a jpeg in their value,
 * discriminated by the claim ids
 */
export const base64ImageSchema = z
  .object({
    id: z
      .string()
      .transform(str => {
        const split = str.split(':');
        return split[split.length - 1];
      })
      .pipe(z.enum(['portrait', 'signature_usual_mark'])),
    label: z.string(),
    value: z.string()
  })
  .transform(obj => obj.value)
  /**
   * This transformation parses the JPEG in search of the segment containing the image size, which
   * will then be returned alongside the data: URI of the image itself
   */
  .transform(b64url => {
    const b64_unpadded = b64url.replaceAll('-', '+').replaceAll('_', '/');
    const b64 =
      b64_unpadded.length % 4 === 0
        ? b64_unpadded
        : b64_unpadded +
          Array.from(Array(4 - (b64_unpadded.length % 4)).keys()).reduce(
            prev => prev + '=',
            ''
          );
    const { width, height } = Buffer.from(b64, 'base64').reduce(
      (prev, byte, index, buffer) => {
        if (prev.done) {
          return { ...prev };
        }

        if (byte === 0xff) {
          return {
            ...prev,
            continue: false
          };
        }

        if (prev.continue) {
          return { ...prev };
        }

        if (JPEG_SOF_CODES.includes(byte)) {
          // These lines extract the proportion of the file from the SOF segment, see https://www.w3.org/Graphics/JPEG/itu-t81.pdf, page 35
          // The casts below are needed because tsc doesn't recognize buffer as an instance of Buffer
          // but of its superclass, Uint8Array
          const imgHeight = (buffer as Buffer).readUint16BE(index + 4);
          const imgWidth = (buffer as Buffer).readUint16BE(index + 6);
          return {
            ...prev,
            height: imgHeight,
            width: imgWidth,
            done: true
          };
        } else {
          return {
            ...prev,
            continue: true
          };
        }
      },
      { height: 0, width: 0, continue: false, done: false }
    );

    if (width === 0 || height === 0) {
      throw new Error();
    }

    return {
      value: 'data:image/jpeg;base64,' + b64,
      type: claimType.image,
      width,
      height
    };
  });

export type Base64ImageClaimType = z.infer<typeof base64ImageSchema>;

export const pdfSchema = z
  .object({
    id: z
      .string()
      .transform(str => {
        const split = str.split(':');
        return split[split.length - 1];
      })
      // For the moment, there is no known PDF claim, so the claim name is generic
      .pipe(z.enum(['pdf'])),
    label: z.string(),
    value: z.string()
  })
  .transform(obj => obj.value)
  .transform(pdf => ({
    value: 'data:application/pdf;base64,' + pdf,
    type: claimType.pdf
  }));

/**
 * Schema to validate claims that are known to be dates for which expiration should be checked
 */
export const dateThatCanExpireSchema = z
  .object({
    id: z.enum(['expiry_date']),
    label: z.string(),
    value: z.string()
  })
  .transform(obj => obj.value)
  .pipe(
    z
      .string()
      .date()
      .transform(str => ({
        value: new Date(str),
        type: claimType.expireDate
      }))
  );

/**
 * Schema to validate claims representing places of birth
 */
export const placeofBirthSchema = z
  .object({
    country: z.string(),
    locality: z.string()
  })
  .transform(claim => ({
    value: claim,
    type: claimType.placeOfBirth
  }));
export type PlaceOfBirthClaimType = z.infer<typeof placeofBirthSchema>;

/**
 * Schema to validate a claim which is a union of the previous defined schemas.
 */
export const claimScheme = z.union([
  base64ImageSchema,
  pdfSchema,
  dateThatCanExpireSchema,
  // In case there isn't a schema for a specific label, we fallback to simply parsing the value
  baseClaimSchemaExtracted.pipe(
    z.union([
      dateSchema,
      drivingPrivilegesSchema,
      verificationEvidenceSchema,
      placeofBirthSchema,
      stringArraySchema,
      booleanSchema,
      numberSchema,
      emptyStringSchema,
      stringSchema
    ])
  )
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

      return { label: attributeName, value: attribute.value, id: key };
    });
};
