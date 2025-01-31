import {PresentationParams} from '../../../wallet/store/presentation';

export const PRESENTATION_INTERNAL_LINK = 'haip://';

export const presentationLinkToUrl = (link: string): PresentationParams => {
  const url = new URL(link);
  if (url.protocol !== PRESENTATION_INTERNAL_LINK) {
    throw new Error('Invalid presentation link');
  }
  const request_uri = url.searchParams.get('request_uri');
  const client_id = url.searchParams.get('client_id');
  if (!request_uri || !client_id) {
    throw new Error('Invalid presentation link');
  }
  return {request_uri, client_id};
};
