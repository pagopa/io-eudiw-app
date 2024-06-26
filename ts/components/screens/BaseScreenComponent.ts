import { TranslationKeys } from "../../../locales/locales";

export type ContextualHelpProps = {
  title: string;
  body: () => React.ReactNode;
};

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};
