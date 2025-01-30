import {truncate} from 'lodash';

/**
 * Truncate long strings to avoid performance issues when rendering claims.
 */
export const getSafeText = (text: string) => truncate(text, {length: 128});

export const isStringNullyOrEmpty = (text: string | null | undefined) =>
  text === null || text === undefined || text.trim().length === 0;
