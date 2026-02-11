import { format as dateFnsFormat } from 'date-fns';
import dfns_de from 'date-fns/locale/de';
import dfns_en from 'date-fns/locale/en';
import dfns_it from 'date-fns/locale/it';
import I18n from 'i18next';
import { getLocalePrimary, Locales } from './locale';

type DateFnsLocale = typeof import('date-fns/locale/it');

type DFNSLocales = Record<Locales, DateFnsLocale>;

const locales: DFNSLocales = { it: dfns_it, en: dfns_en, de: dfns_de };

export function format(
  date: string | number | Date,
  dateFormat?: string
): ReturnType<typeof dateFnsFormat> {
  const localePrimary = getLocalePrimary(I18n.language);
  const locale = locales[localePrimary as Locales];
  return dateFnsFormat(
    date,
    dateFormat,
    locale
      ? {
          locale
        }
      : undefined
  );
}
