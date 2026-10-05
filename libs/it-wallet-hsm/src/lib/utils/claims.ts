import * as z from 'zod';

import { ClaimDisplayFormat } from './itwRemotePresentationUtils';
import { ParsedCredential } from './itwTypesUtils';
import { getClaimsFullLocale } from './locale';

/**
 * Constants to represent the type of the claim.
 * This can be later used to narrow the type of the claim parsed with {@link claimScheme}
 */
export const claimType = {
  barcode: 'barcode',
  boolean: 'boolean',
  date: 'date',
  drivingPrivileges: 'drivingPrivileges',
  emptyString: 'emptyString',
  expireDate: 'expireDate',
  image: 'image',
  placeOfBirth: 'placeOfBirth',
  string: 'string',
  stringArray: 'stringArray',
  verification: 'verification',
  verificationEvidence: 'verificationEvidence'
} as const;

/**
 * Schema that represents a generic claim structure, used to pipe generic conversion behavior
 */
const baseClaimSchema = z.object({
  id: z.string(),
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
const dateSchema = z
  .union([z.string().date(), z.string().datetime()])
  .transform(str => ({
    type: claimType.date,
    value: new Date(str)
  }));

/**
 * Schema to validate a string when the base claim label is not specified.
 */
const stringSchema = z.string().transform(str => ({
  type: claimType.string,
  value: str
}));

/**
 * Schema to validate an empty string
 */
const emptyStringSchema = z
  .string()
  .refine(str => str === '')
  .transform(str => ({
    type: claimType.emptyString,
    value: str
  }));

/**
 * Schema to validate an array of strings when the base claim label is not specified.
 */
const stringArraySchema = z
  .string()
  .array()
  .transform(array => ({
    type: claimType.stringArray,
    value: array
  }));

/**
 * Schema to validate a boolean when the base claim label is not specified
 */
const booleanSchema = z.boolean().transform(bool => ({
  type: claimType.boolean,
  value: bool
}));

/**
 * Schema to validate a number when the base claim label is not specified
 */
const numberSchema = z.number().transform(num => ({
  type: claimType.string,
  value: String(num)
}));

/**
 * Schema to validate a verification evidence claim of the MDL when the base claim label is not specified
 */
export const verificationEvidenceSchema = z
  .object({
    country_code: z.string(),
    organization_id: z.string(),
    organization_name: z.string()
  })
  .transform(obj => ({
    type: claimType.verificationEvidence,
    value: obj
  }));

/**
 * Schema to validate a dirving privileges claim of the MDL when the base claim label is not specified
 */
export const drivingPrivilegesSchema = z
  .array(
    z.object({
      expiry_date: z.string().date(),
      issue_date: z.string().date(),
      vehicle_category_code: z.string()
    })
  )
  .transform(arr => ({
    type: claimType.drivingPrivileges,
    value: arr
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
const base64ImageSchema = z
  .object({
    id: z
      .string()
      .transform(str => {
        const split = str.split(':');
        return split[split.length - 1];
      })
      .pipe(z.enum(['portrait', 'signature_usual_mark'])),
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
    const { height, width } = Buffer.from(b64, 'base64').reduce(
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
            done: true,
            height: imgHeight,
            width: imgWidth
          };
        } else {
          return {
            ...prev,
            continue: true
          };
        }
      },
      { continue: false, done: false, height: 0, width: 0 }
    );

    if (width === 0 || height === 0) {
      throw new Error();
    }

    return {
      height,
      type: claimType.image,
      value: 'data:image/jpeg;base64,' + b64,
      width
    };
  });

/**
 * Schema to validate claims that are known to be dates for which expiration should be checked
 */
const dateThatCanExpireSchema = z
  .object({
    id: z.enum(['expiry_date']),
    value: z.string()
  })
  .transform(obj => obj.value)
  .pipe(
    z
      .string()
      .date()
      .transform(str => ({
        type: claimType.expireDate,
        value: new Date(str)
      }))
  );

/**
 * Schema to validate claims representing places of birth
 */
export const placeofBirthSchema = z
  .object({
    country: z.object({
      name: z.record(z.string(), z.string()),
      value: z.string()
    }),
    locality: z.object({
      name: z.record(z.string(), z.string()),
      value: z.string()
    }),
    region: z.object({
      name: z.record(z.string(), z.string()),
      value: z.string()
    })
  })
  .transform(data => {
    const values =
      data.locality.value +
      ', ' +
      data.region.value +
      ', ' +
      data.country.value;
    return {
      type: claimType.placeOfBirth,
      value: values
    };
  });
export type PlaceOfBirthClaimType = z.infer<typeof placeofBirthSchema>;

export const verificationScheme = z
  .object({
    assurance_level: z.object({
      name: z.record(z.string(), z.string()),
      value: z.string()
    }),
    trust_framework: z.object({
      name: z.record(z.string(), z.string()),
      value: z.string()
    })
  })
  .transform(data => {
    const values =
      data.assurance_level.value + ' ' + data.trust_framework.value;
    return {
      type: claimType.verification,
      value: values
    };
  });

/**
 * Schema to validate a barcode claim value (e.g. discount code for PARI_BONUS)
 */
const barcodeSchema = z.string().transform(str => ({
  type: claimType.barcode,
  value: str
}));

/**
 * Schema to validate an amount claim. The raw value is expressed in euro cents
 * and is converted to a localized euro currency string.
 */
const amountSchema = z
  .object({
    id: z.enum(['amount']),
    value: z.union([z.string(), z.number()])
  })
  .transform(obj => {
    const cents = typeof obj.value === 'string' ? Number(obj.value) : obj.value;
    const euros = cents / 100;
    return {
      type: claimType.string,
      value: new Intl.NumberFormat(getClaimsFullLocale(), {
        currency: 'EUR',
        style: 'currency'
      }).format(euros)
    };
  });

/**
 * Schema to validate a claim which is a union of the previous defined schemas.
 */
export const claimScheme = z.union([
  base64ImageSchema,
  dateThatCanExpireSchema,
  amountSchema,
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
      verificationScheme,
      stringSchema,
      barcodeSchema
    ])
  )
]);

export type ClaimScheme = z.infer<typeof claimScheme>;

export type ParsedClaimsRecord = Record<
  string,
  { label: string; parsed: ClaimScheme | undefined }
>;

/**
 * Parses the credential claims and transforms them into an indexed record.
 * For each entry in the credential, it maps the key and the attribute to a label and a processed value.
 * * * The label is determined by the attribute name:
 * - If the name is a string, it is used directly (locales not set).
 * - If the name is a localization record, the translation matching the current locale is selected.
 * - If no match is found for the locale, the attribute key is used as a fallback.
 * * * The function also allows filtering specific claims through the `exclude` option.
 * * @param parsedCredential - The source parsed credential.
 * @param options - Configuration options, including a list of keys to exclude.
 * @returns A {@link ParsedClaimsRecord} object containing the mapped and validated claims.
 */
export const parseClaimsToRecord = (
  parsedCredential: ParsedCredential,
  options: { exclude?: string[] } = {}
): ParsedClaimsRecord => {
  const { exclude = [] } = options;
  return Object.fromEntries(
    Object.entries(parsedCredential)
      .filter(([key]) => !exclude.includes(key))
      .map(([key, attribute]) => {
        const attributeName =
          typeof attribute.name === 'string'
            ? attribute.name
            : attribute.name?.[getClaimsFullLocale()] || key;

        return [
          key,
          {
            label: attributeName,
            parsed: claimScheme.parse({ id: key, value: attribute.value })
          }
        ];
      })
  );
};

/**
 * Parses the claims from the credential, including nested claims.
 * For each Record entry, it maps the key and the attribute value to a label and a value.
 * If a claim's value is an array of objects, it recursively parses each object.
 * The label is taken from the attribute name which is either a string or a record of locale and string.
 * If the type of the attribute name is string then we take its value because locales have not been set.
 * If the type of the attribute name is a record then we take the value of the locale that matches the current locale.
 * If there's no locale that matches the current locale then we take the attribute key as the name.
 * The value is taken from the attribute value.
 * @param parsedCredential - the parsed credential.
 * @param options.exclude - an array of keys to exclude from the claims. TODO [SIW-1383]: remove this dirty hack
 * @returns the array of {@link ClaimDisplayFormat} of the credential contained in its configuration schema.
 */
export const parseClaims = (
  parsedCredential: ParsedCredential,
  options: { exclude?: string[] } = {}
): ClaimDisplayFormat[] => {
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
