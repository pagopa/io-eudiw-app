import { LocaleResource } from '../interfaces';
import { default as jsonLocale } from './it/common.json';

export const resource = {
  it: {
    common: jsonLocale
  }
} satisfies LocaleResource;
