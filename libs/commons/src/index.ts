import { default as jsonLocale } from './lib/locales/it/common.json';
import { Resource } from 'i18next';

export * from './lib/utils/string';
export * from './lib/types/utils';

export * from './lib/utils/brightness';
export * from './lib/utils/device';
export * from './lib/utils/url';

export * from './lib/middleware/listener/effects';
export * from './lib/persistors/secureStorage';
export * from './lib/utils/clipboard';

export * from './lib/utils/color';
export * from './lib/utils/crypto';

export * from './lib/utils/asyncStatus';

export * from './lib/utils/common';
export * from './lib/utils/env';

export * from './lib/components';
export * from './lib/hooks';

export const resource: Resource = {
  it: {
    common: jsonLocale
  }
};

export type DefaultResource = {
  common: typeof jsonLocale;
};
