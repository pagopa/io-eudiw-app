import {
  CREDENTIAL_OFFER_INTERNAL_LINKS,
  PRESENTATION_INTERNAL_LINKS
} from '../navigation/main/deepLinkSchemas';
import { PresentationPreDefinitionParams } from '../screens/presentation/PresentationPreDefinition';

/**
 * Checks whether the given URL's protocol matches one of the provided schemes.
 * @param url - The parsed URL.
 * @param schemes - A list of schemes in the `scheme://` form.
 * @returns true if the URL protocol matches one of the schemes.
 */
const matchesScheme = (url: URL, schemes: ReadonlyArray<string>): boolean =>
  schemes.some(
    uri => url.protocol === uri.substring(0, uri.length - 2) // Remove last two characters ('//')
  );

/**
 * Parses a URL result from a QR code scan to a presentation link.
 * It extracts the request_uri and client_id from the URL, otherwise throws an error.
 * @param link - The URL to parse.
 * @returns request_uri and client_id from the URL.
 */
export const presentationLinkToUrl = (
  link: string
): PresentationPreDefinitionParams => {
  const url = new URL(link);
  if (!matchesScheme(url, PRESENTATION_INTERNAL_LINKS)) {
    throw new Error('Invalid presentation link');
  }
  const request_uri = url.searchParams.get('request_uri');
  const client_id = url.searchParams.get('client_id');
  const state = url.searchParams.get('state');
  const request_uri_method = url.searchParams.get('request_uri_method') as
    | 'get'
    | 'post';
  if (!request_uri || !client_id) {
    throw new Error('Invalid presentation link');
  }
  return {
    request_uri: request_uri,
    client_id: client_id,
    state: state ?? undefined,
    request_uri_method
  };
};

/**
 * Discriminated result of parsing a wallet deep link.
 * Either a credential presentation request or a credential offer (OID4VCI).
 */
export type ParsedDeepLink =
  | { kind: 'presentation'; params: PresentationPreDefinitionParams }
  | { kind: 'credentialOffer'; url: string };

/**
 * Classifies a wallet deep link by its scheme and parses it accordingly.
 * Presentation links are fully parsed into their params; credential offer links
 * are recognized by scheme only (handling is deferred to the offer flow).
 * @param link - The full deep link URL, including its scheme.
 * @returns The parsed deep link.
 * @throws If the link is neither a valid presentation link nor a credential offer.
 */
export const parseDeepLink = (link: string): ParsedDeepLink => {
  const url = new URL(link);
  if (matchesScheme(url, CREDENTIAL_OFFER_INTERNAL_LINKS)) {
    return { kind: 'credentialOffer', url: link };
  }
  // Throws if the link is not a valid presentation link either.
  return { kind: 'presentation', params: presentationLinkToUrl(link) };
};
