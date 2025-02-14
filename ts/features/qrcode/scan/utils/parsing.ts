import {PRESENTATION_INTERNAL_LINKS} from '../../../../navigation/deepLinkSchemas';
import {PresentationParams} from '../../../wallet/store/presentation';

/**
 * Parses a URL result from a QR code scan to a presentation link.
 * It extracts the request_uri and client_id from the URL, otherwise throws an error.
 * @param link - The URL to parse.
 * @returns request_uri and client_id from the URL.
 */
export const presentationLinkToUrl = (link: string): PresentationParams => {
  const url = new URL(link);
  if (
    !PRESENTATION_INTERNAL_LINKS.some(
      uri => url.protocol === uri.substring(0, uri.length - 2) // Remove last two characters (':')
    )
  ) {
    throw new Error('Invalid presentation link');
  }
  const request_uri = url.searchParams.get('request_uri');
  const client_id = url.searchParams.get('client_id');
  if (!request_uri || !client_id) {
    throw new Error('Invalid presentation link');
  }
  return {request_uri, client_id};
};
