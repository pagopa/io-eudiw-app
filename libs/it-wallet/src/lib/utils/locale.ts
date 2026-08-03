import i18next from 'i18next';

/**
 * Enum for the claims locales.
 * This is used to get the correct locale for the claims.
 * Currently the only supported locales are it-IT and en-US.
 */
export enum ClaimsLocales {
  en = 'en-US',
  it = 'it-IT'
}

export type Locales = 'de' | 'en' | 'it';

/**
 * Map from the app locales to the claims locales.
 * Currently en is mapped to en-US and it to it-IT.
 */
const localeToClaimsLocales = new Map<string, ClaimsLocales>([
  ['en', ClaimsLocales.en],
  ['it', ClaimsLocales.it]
]);

/**
 * Helper function to get a full claims locale locale from the current app locale.
 * @returns a enum value for the claims locale.
 */
export const getClaimsFullLocale = (): ClaimsLocales =>
  localeToClaimsLocales.get(i18next.resolvedLanguage ?? ClaimsLocales.it) ??
  ClaimsLocales.it;

/**
 * Returns the primary component of a locale
 *
 * @see https://en.wikipedia.org/wiki/IETF_language_tag
 */
export function getLocalePrimary(locale: string, separator = '-'): string {
  return locale.split(separator).filter(_ => _.length > 0)?.[0];
}
