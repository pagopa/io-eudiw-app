import * as O from "fp-ts/lib/Option";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18n-js";
/**
 * Helpers for handling locales
 */

/**
 * Returns the primary component of a locale
 *
 * @see https://en.wikipedia.org/wiki/IETF_language_tag
 */
export function getLocalePrimary(
  locale: string,
  separator: string = "-"
): O.Option<string> {
  return pipe(
    O.some(locale.split(separator)),
    O.filter(_ => _.length > 0),
    O.chain(AR.head)
  );
}

export const localeDateFormat = (date: Date, format: string): string =>
  isNaN(date.getTime())
    ? I18n.t("global.date.invalid")
    : I18n.strftime(date, format);
