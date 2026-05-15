interface AuthHeaders {
  'x-user-id'?: string;
  'x-spec-version'?: string;
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
 * Creates a fetch function for the wallet provider functions that adds the Authorization header
 * with the session token if the user is logged in and the URL matches the wallet provider base URL.
 * @param url - The URL object to check against the wallet provider base URL
 * @param sessionToken - The session token bearer token to be added to the Authorization header
 * @returns A fetch function that can be used to make requests to the wallet provider.
 * @throws ItwSessionExpiredError
 */
export function createWalletFetch(
  sessionId: string
): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, addAuthHeaders({
      'x-user-id': sessionId,
      'x-spec-version': '1.3'
    }, init));
}
