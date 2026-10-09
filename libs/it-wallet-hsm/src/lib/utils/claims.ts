import * as z from 'zod';

import { ClaimDisplayFormat } from './itwRemotePresentationUtils';
import { ParsedCredential } from './itwTypesUtils';
import { getClaimsFullLocale } from './locale';

/**
 * Constants to represent the type of the claim.
 * This can be later used to narrow the type of the claim parsed with {@link claimScheme}
 */
export const claimType = {
  image: 'image',
  string: 'string'
} as const;

/**
 * These bytes represent the possible kinds of SOF segments, which contain the image's proportions,
 * that can be found within a JPEG file, see https://www.w3.org/Graphics/JPEG/itu-t81.pdf, page 32
 */
const JPEG_SOF_CODES = [
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
  0xcf
];

/**
 * Detects images from their value: either a data URI or a base64(url) JPEG, which always starts with `/9j/`
 */
const IMAGE_VALUE_REGEX = /^(data:image\/|[/_]9j[/_])/;

/**
 * Schema to validate claims that have an image (JPEG) in their value, detected from the value itself
 */
const base64ImageSchema = z
  .object({
    id: z.string(),
    value: z.string().regex(IMAGE_VALUE_REGEX)
  })
  .transform(obj => obj.value)
  /**
   * This transformation parses the JPEG in search of the segment containing the image size, which
   * will then be returned alongside the data: URI of the image itself
   */
  .transform(b64url => {
    const b64_unpadded = b64url
      .replace(/^data:image\/[a-z]+;base64,/, '')
      .replaceAll('-', '+')
      .replaceAll('_', '/');
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

    // Fall back to a square when the JPEG size can't be read
    return {
      height: height || 1,
      type: claimType.image,
      value: 'data:image/jpeg;base64,' + b64,
      width: width || 1
    };
  });

/**
 * Schema for every claim which is not an image: the value is rendered as plain text,
 * with non-string values (numbers, booleans, arrays, objects) serialized as JSON.
 */
const stringSchema = z
  .object({
    id: z.string(),
    value: z.unknown()
  })
  .transform(({ value }) => ({
    type: claimType.string,
    value: typeof value === 'string' ? value : JSON.stringify(value)
  }));

/**
 * Schema to validate a claim which is either an image or a plain text claim.
 */
export const claimScheme = z.union([base64ImageSchema, stringSchema]);

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
