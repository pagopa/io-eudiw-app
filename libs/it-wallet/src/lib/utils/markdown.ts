import {
  linkNodeToReactNative,
  openWebUrl,
  paragraphNodeToReactNative,
  ParagraphSize,
  Renderer
} from '@io-eudiw-app/commons';
import { TxtLinkNode, TxtParagraphNode } from '@textlint/ast-node-types';

type Options = {
  /**
   * The callback to call when the link is pressed
   */
  linkCallback: () => void;
  /**
   * The size of the paragraph nodes to render
   */
  paragraphSize?: ParagraphSize;
};

/**
 * Generate custom rules for the markdown component used in IT-Wallet screens
 * @param options {@link Options} to customize the markdown rules
 * @returns the rules for the markdown component
 */
export const generateItwIOMarkdownRules = ({
  paragraphSize,
  linkCallback
}: Options) => ({
  Link(link: TxtLinkNode, render: Renderer) {
    return linkNodeToReactNative(
      link,
      {
        size: paragraphSize,
        onPress: () => {
          openWebUrl(link.url, () => null);
          linkCallback();
        }
      },
      render
    );
  },
  Paragraph(
    paragraph: TxtParagraphNode,
    render: Renderer,
    screenReaderEnabled: boolean
  ) {
    return paragraphNodeToReactNative(
      paragraph,
      { screenReaderEnabled, size: paragraphSize },
      render
    );
  }
});
