import I18n from "react-native-i18n";

// If the following import is missing, generate it by running:
// npm run generate:locales
import * as locales from "../locales/locales";

type FallBackLocale = {
  locale: "en";
};

// define the locale fallback used in the whole app code
export const localeFallback: FallBackLocale = {
  locale: "en"
};

// eslint-disable-next-line
I18n.fallbacks = true;
// Should the app fallback to Italian if user locale (o the current translation key) doesn't exists
// eslint-disable-next-line
I18n.defaultLocale = localeFallback.locale;

// Define the supported translations
// eslint-disable-next-line
I18n.translations = {
  en: locales.localeEN
};

export const availableTranslations: ReadonlyArray<locales.Locales> =
  Object.keys(I18n.translations).map(k => k as locales.Locales);

export function setLocale(lang: locales.Locales) {
  // eslint-disable-next-line
  I18n.locale = lang;
}

type TranslateT = {
  // allow unsafe translations only when a defaultValue gets passed
  // allows the use of implicit pluralization of translations, use count as numeral variable
  // how-to use pluralization explained here https://github.com/pagopa/io-app/pull/2366
  (
    scope: string,
    options: { defaultValue: string; count?: number } & Omit<
      I18n.TranslateOptions,
      "defaultValue"
    >
  ): string;
  // or else, the lookup must be safe
  (scope: locales.TranslationKeys, options?: I18n.TranslateOptions): string;
};

/**
 * Replacement for the I18n type for making the
 *
 * We can't simply add our definition for "t" as it will be
 * merged with the existing one (overloaded) keeping it unsafe by
 * making it accept any key.
 */
interface TypedI18n {
  readonly t: TranslateT;
  readonly translate: TranslateT;
  readonly locale: locales.Locales;
  readonly currentLocale: () => locales.Locales;
  readonly toNumber: typeof I18n.toNumber;
  readonly toCurrency: typeof I18n.toCurrency;
  readonly strftime: typeof I18n.strftime;
  readonly toTime: typeof I18n.toTime;
}

const TypedI18n = I18n as TypedI18n;

export default TypedI18n;
