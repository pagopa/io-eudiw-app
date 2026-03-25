import rawResources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof rawResources;
    defaultNS: never;
  }
}
