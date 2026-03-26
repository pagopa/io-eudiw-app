import { DefaultResource } from '.';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: DefaultResource;
    defaultNS: never;
  }
}
