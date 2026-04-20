import { Resource, ResourceLanguage } from 'i18next';

/**
 * Enforces that every locale resource defines at least the italian language.
 */
export interface LocaleResource extends Resource {
  it: ResourceLanguage;
}
