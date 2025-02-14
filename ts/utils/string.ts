import {truncate} from 'lodash';

/**
 * Truncate long strings to avoid performance issues when rendering claims.
 */
export const getSafeText = (text: string) => truncate(text, {length: 128});

/**
 * Checks whether a string is null, undefined or empty.
 * @param text - The string to check
 * @returns true if the text is null, undefined or empty, false otherwise
 */
export const isStringNullyOrEmpty = (text: string | null | undefined) =>
  text === null || text === undefined || text.trim().length === 0;
