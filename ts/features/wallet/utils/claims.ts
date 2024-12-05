import * as z from 'zod';
import {ClaimDisplayFormat, ParsedCredential} from './types';

import {getClaimsFullLocale} from './locale';

export const dateSchema = z.string().date();

export const stringSchema = z.string();

export const claimScheme = z.union([dateSchema, stringSchema]);

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
