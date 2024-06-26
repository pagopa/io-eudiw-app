import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../components/screens/BaseScreenComponent";
import { FAQsCategoriesType } from "../utils/faq";

export interface SupportRequestParams {
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
}

export const useStartSupportRequest = ({
  faqCategories,
  contextualHelp,
  contextualHelpMarkdown
}: SupportRequestParams) => {
  return () => {}; // TODO: empty for now
};
