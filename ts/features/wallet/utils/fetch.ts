import Config from 'react-native-config';
import {URL as PolyfillURL} from 'react-native-url-polyfill';

interface AuthHeaders {
  'x-user-id'?: string;
}

/**
 * Adds the authorization headers to the request initialization object.
 * It merges the provided authorization headers with the existing headers.
 * @param authHeaders - An object containing authorization headers to be added to the request.
 * @param init - An optional RequestInit object that may contain existing headers.
 * @returns An object with the merged headers
 */
const addAuthHeaders = (authHeaders: AuthHeaders, init?: RequestInit) => ({
  ...init,
  headers: {
    ...init?.headers,
    ...authHeaders
  }
});

/**
 * Getter for the authorization headers for the wallet provider based on the provided URL.
 * If the URL's origin matches the wallet provider's base URL and the user is logged in,
 * it returns the Authorization header with the session token.
 * Otherwise, it returns an empty object.
 * @param url - The URL object to check against the wallet provider base URL
 * @param sessionToken - The session token bearer token to be added to the Authorization header
 * @throws {@link TypeError} if the wallet provider URL is not valid
 * @returns An object containing the Authorization header if conditions are met, otherwise an empty object
 */
const getAuthHeadersForWalletProvider = (
  url: string,
  sessionId: string
): AuthHeaders => {
  const urlTarget = new PolyfillURL(url);
  const urlWp = new PolyfillURL(Config.WALLET_PROVIDER_BASE_URL);
  if (urlTarget.origin === urlWp.origin) {
    return {
      'x-user-id': sessionId
    };
  }
  return {};
};

/**
 * Creates a fetch function for the wallet provider functions that adds the Authorization header
 * with the session token if the user is logged in and the URL matches the wallet provider base URL.
 * @param url - The URL object to check against the wallet provider base URL
 * @param sessionToken - The session token bearer token to be added to the Authorization header
 * @returns A fetch function that can be used to make requests to the wallet provider.
 * @throws ItwSessionExpiredError
 */
export function createWalletProviderFetch(
  url: string,
  sessionId: string
): typeof fetch {
  const authHeader = getAuthHeadersForWalletProvider(url, sessionId);

  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, addAuthHeaders(authHeader, init));
}

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function fetchWithExponentialBackoff(
  url: string,
  options: FetchOptions,
  maxRetries = 5,
  baseDelay = 500,
  retries = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries < maxRetries) {
      const delay = baseDelay * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithExponentialBackoff(
        url,
        options,
        maxRetries,
        baseDelay,
        retries + 1
      );
    }
    throw error;
  }
}
