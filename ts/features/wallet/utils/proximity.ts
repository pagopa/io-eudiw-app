import {CBOR} from '@pagopa/io-react-native-cbor';
import {VerifierRequest} from '@pagopa/io-react-native-proximity';
import {ParsedCredential, StoredCredential} from './types';

type StoredCredentialWithIssuerSigned = StoredCredential & {
  issuerSigned: CBOR.IssuerSigned;
};

/**
 * Helper function to generate the attributes for the {@link matchRequestToClaims} method.
 * For a given Verifier Request namespace-required attributes, this method looks for matches
 * and creates an object where to each namespace corresponds an object containing the
 * attribute's value and display info as found in the {@link StoredCredentialWithIssuerSigned}
 */
const getAttributesExtractor =
  (credential: StoredCredentialWithIssuerSigned) =>
  (
    accumulated: Record<string, ParsedCredential[string]>,
    attribute: string
  ) => {
    const value = credential.parsedCredential[attribute];
    // If the credential contains the attribute, add it to the accumulator, otherwise go to the next attribute
    return value ? {...accumulated, [attribute]: value} : accumulated;
  };

/**
 * Helper function to generate the namespaces for the {@link matchRequestToClaims} method.
 * For a given credential and Verifier required namespaces, this method looks for matches
 * and creates an object where to each namespace corresponds an object mapping the attributes to 
 * their value and display info as found in the {@link StoredCredentialWithIssuerSigned}

 * containing the attribute value and display info as found in the {@link StoredCredentialWithIssuerSigned}
 
 * @param credential a {@link StoredCredentialWithIssuerSigned} containing the claims values and display info
 * @returns an object where to each namespace corresponds an object mapping the attributes to 
 *          their value and display info as found in the {@link StoredCredentialWithIssuerSigned}
 */
const getNameSpaceExtractor =
  (credential: StoredCredentialWithIssuerSigned) =>
  /**
   * @param namespace : A Verifier Request namespace
   * @param attributes : The Verifier requested namespace attributes
   */
  (
    accumulated: Record<string, Record<string, ParsedCredential[string]>>,
    [namespace, attributes]: [string, boolean | Record<string, boolean>]
  ) => {
    // Check first if the credential contains the required namespace
    const namespaces = credential.issuerSigned.nameSpaces;
    if (!(namespace in namespaces)) {
      return accumulated;
    }
    // Then check if attributes is an object and not a simple boolean
    if (typeof attributes !== 'object') {
      return accumulated;
    }
    // If found and not a boolean, combine the attributes required for the specific namespace
    // by the Verifier Request with claim values and display info from the credentials,
    // if matches are found
    const foundAttributes = Object.keys(attributes).reduce<
      Record<string, ParsedCredential[string]>
    >(getAttributesExtractor(credential), {});
    return Object.keys(foundAttributes).length !== 0
      ? // If attributes have been found add the namespace new entry containing attribute
        // values and display data to the accumulator
        {
          ...accumulated,
          [namespace]: foundAttributes
        }
      : // If no attribute has been found go to the next namespace
        accumulated;
  };

/**
 * Helper function for the {@link matchRequestToClaims} method.
 * This function filters the isAuthenticated field of the Verifier required namespace object
 * and then generates an object where to each namespace corresponds an object mapping the attributes to
 * their value and display info as found in the {@link StoredCredentialWithIssuerSigned}
 *
 * @param value An object contining required namespaces and isAuthenticated info for a credential type of a {@link VerifierRequest}
 * @param credential a {@link StoredCredentialWithIssuerSigned} containing the claims values and display info
 * @returns an object where to each namespace corresponds an object mapping the attributes to
 *          their value and display info as found in the {@link StoredCredentialWithIssuerSigned}
 */
const extractNamespaces = (
  namespacesAndIsAuthenticated: VerifierRequest['request'][string],
  credential: StoredCredentialWithIssuerSigned
) =>
  Object.entries(namespacesAndIsAuthenticated)
    // Filter the isAuthenticated key, which is not a namespace
    .filter(([key, _]) => key !== 'isAuthenticated')
    // Combine the namespaces and attributes required by the Verifier Request with
    // claim values and display info from the credentials, if matches are found
    .reduce<Record<string, Record<string, ParsedCredential[string]>>>(
      getNameSpaceExtractor(credential),
      {}
    );

/**
 * This method matches every required attribute contained in a {@link VerifierRequest} to its
 * corresponding entry in one of the decoded credentials and generates an object which, for
 * every matched attribute, corresponds the claim value and display info found inside the credential,
 * keeping the original
 * {
 *  credentialType : {
 *    namespace : {
 *      attributes...
 *    }
 *  }
 * }
 * structure.
 * @param request A {@link VerifierRequest} request field
 * @param decodedCredentials An array of {@link StoredCredentialWithIssuerSigned} mDoc credentials
 * @returns see description
 */
const mapVerifierRequestToClaimInfo = (
  request: VerifierRequest['request'],
  decodedCredentials: Array<StoredCredentialWithIssuerSigned>
) =>
  Object.entries(request).reduce<
    Record<string, Record<string, Record<string, ParsedCredential[string]>>>
  >((accumulated, [credentialType, value]) => {
    // Search for a credential of the same credential type specified in the Verifier Request
    const credential = decodedCredentials.find(
      cred => cred.credentialType === credentialType
    );
    // If no matching credential has been found go to the next Verifier required credential
    if (!credential) {
      return accumulated;
    }
    const foundNamespaces = extractNamespaces(value, credential);
    return Object.keys(foundNamespaces).length !== 0
      ? // If namespaces have been found add a new entry to the accumulator
        {
          ...accumulated,
          [credentialType]: foundNamespaces
        }
      : // Otherwise, if no namespace has been found or no attributes in any namespace have been found go to the next Verifier required credential
        accumulated;
  }, {});

/**
 * This helper function takes a {@link VerifierRequest}, looks for
 * the presence of the required claims in the mDoc credentials and, if
 * found adds the {@link ParsedCredential} entry for the attribute to
 * an object following the same path structure of the original credential
 * @param verifierRequest The authentication request sent by the verifier
 * @param credentialsMdoc The mdoc credentials contained in the wallet
 * @returns An object that is a record of credential types to an object
 * which has the same structure of a decoded mDoc credential's namespaces
 * except for the fact that the namespace attribute keys are mapped to
 * the value corresponding to the same attribute key inside of the
 * {@link ParsedCredential} object.
 */
export const matchRequestToClaims = async (
  verifierRequest: VerifierRequest,
  credentialsMdoc: Array<StoredCredential>
) => {
  const decodedCredentials: Array<StoredCredentialWithIssuerSigned> =
    await Promise.all(
      credentialsMdoc.map(async credential => {
        const decodedIssuerSigned = await CBOR.decodeIssuerSigned(
          credential.credential
        );
        return {
          ...credential,
          issuerSigned: decodedIssuerSigned
        };
      })
    );

  return mapVerifierRequestToClaimInfo(
    verifierRequest.request,
    decodedCredentials
  );
};

/**
 * Returns true if all the `isAuthenticated` flags in the Verifier Request are set to true, false otherwise.
 * @param verifierRequest - The Verifier Request object containing the requested fields
 * @returns true if the verifier request is authenticated, false otherwise
 */
export const getAuthenticatedFlag = (verifierRequest: VerifierRequest) =>
  Object.values(verifierRequest.request).every(
    credential => credential.isAuthenticated === true
  );

/**
 * Array containing the verifier certificates.
 * This can be used by mapping the array to the certificate field while starting the Proximity flow.
 * Even though the name is not used, it can be useful to identify who the certificate belongs to.
 */
export const verifierCertificates: Array<{name: string; certificate: string}> =
  [
    {
      name: 'ca_ca_i_gb_fime_004.pem',
      certificate:
        'MIICtzCCAhqgAwIBAgIJQAAAAAAAAAAAMAoGCCqGSM49BAMEMEIxCzAJBgNVBAYTAkdCMQ0wCwYDVQQKDARGaW1lMSQwIgYDVQQDDBtUZXN0IFJvb3QgQ0EgY2VydCAxIGZvciBtREwwHhcNMjQwNzAyMTIwNzMwWhcNMzgwMzExMTIwNzMwWjBCMQswCQYDVQQGEwJHQjENMAsGA1UECgwERmltZTEkMCIGA1UEAwwbVGVzdCBSb290IENBIGNlcnQgMSBmb3IgbURMMIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQA6MavwVNxodDk+iqluCB69FAtcKOZvwe0eRg0qmgMKP9Goy1xBbDb418beDCIHOIU7BT4e/nd0JfBqIBB1zZ18fQANLGWFdcrEfRLwmo6vHlSbbGxcKb9TTaoJpYoMZhGlH5E9XKI6rTmnEDaIhnZvXkFvV3l8NohJqkjsESmwDXPoRyjgbUwgbIwHQYDVR0OBBYEFIvnsi4kANtVvCMuvQJntvI9KPbJMA4GA1UdDwEB/wQEAwIBBjAeBgNVHRIEFzAVhhNodHRwczovL3d3dy5pc28ub3JnMBIGA1UdEwEB/wQIMAYBAf8CAQAwTQYDVR0fBEYwRDBCoECgPoY8aHR0cDovL21kbC5zZWxmdGVzdHBsYXRmb3JtLmNvbS9qdWwyNC9jcmwvdG9vbF9jcmxfY2FfMDEuY3JsMAoGCCqGSM49BAMEA4GKADCBhgJBC+nnOkmYYR8iwCKUsdS+vPTmLerSJPKJaSAIRxyk9IsVyTQv3bxHX0h4lTWySYiEsJKSxFDsTs0EFIF6QsweaM0CQWPj8nmDwmZpGg88gF5PjVcDpoNAiPKJis7iKbm8d3ShD59IFdHPSEKBtrxKXZi0AO/oXLNHbm3VqwwmFlQR/Nhp'
    },
    {
      name: 'ca_ca_i_gb_fime_005.pem',
      certificate:
        'MIICtTCCAhqgAwIBAgIJUAAAAAAAAAAAMAoGCCqGSM49BAMEMEIxCzAJBgNVBAYTAkdCMQ0wCwYDVQQKDARGaW1lMSQwIgYDVQQDDBtUZXN0IFJvb3QgQ0EgY2VydCAyIGZvciBtREwwHhcNMjQwNzAyMTIwNzMwWhcNMzgwMzExMTIwNzMwWjBCMQswCQYDVQQGEwJHQjENMAsGA1UECgwERmltZTEkMCIGA1UEAwwbVGVzdCBSb290IENBIGNlcnQgMiBmb3IgbURMMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDQOBggAEIlUnF07ghjdG/l7RUBnUbm6qKm3EJQz0Y95n8DS6StPOALtahok5a2VYp8DL+hoSJjapBFWkKPymr7/2au5XE4h3xLDOP+aBgWyaHszCNKyTDFLhyyg1jzT9e2ww3gre/tgywrJA37Xkg6rXfv4G6Bj0yZfORS3wDee6gcBNUU2jgbUwgbIwHQYDVR0OBBYEFEju8em7DmNnRpAy7Sd3uRWkdwbhMA4GA1UdDwEB/wQEAwIBBjAeBgNVHRIEFzAVhhNodHRwczovL3d3dy5pc28ub3JnMBIGA1UdEwEB/wQIMAYBAf8CAQAwTQYDVR0fBEYwRDBCoECgPoY8aHR0cDovL21kbC5zZWxmdGVzdHBsYXRmb3JtLmNvbS9qdWwyNC9jcmwvdG9vbF9jcmxfY2FfMDIuY3JsMAoGCCqGSM49BAMEA4GIADCBhAJABMLSaLWQwzHYCo0aL1CuxP+yXaTHFwF+HFOKohC808Bd0r2vg/+kf9AfvBvWQanS/fxchvl01qI6Xxt9ME4dEwJAC1F0zGZ8ZWM3qhMorzOczEAK1+PvYFNR78vFugiEaoJfzZpYI7c7KYcQLJBZ8sbZHM32ClAAgH65jf8/9RD5+w=='
    },
    {
      name: 'ca_ca_r_at_asit_000.pem',
      certificate:
        'MIICJzCCAc6gAwIBAgIUSvMftn/oM3etHjE7hdIBl6tWMV8wCgYIKoZIzj0EAwIwMzELMAkGA1UEBhMCQVQxDjAMBgNVBAoMBUEtU0lUMRQwEgYDVQQDDAtWYWxlcmEgSUFDQTAeFw0yNTA2MjYwODI0MDJaFw0yNjA2MjYwODI0MDJaMDMxCzAJBgNVBAYTAkFUMQ4wDAYDVQQKDAVBLVNJVDEUMBIGA1UEAwwLVmFsZXJhIElBQ0EwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQmm+pmyUxx/x2eD131E8HhvNkhsfYQXzefZlxgLXQPqCOxO+VPOXVOKL0dUy+kHyT5IP/NOAh038coAVOgGPT4o4G/MIG8MBIGA1UdEwEB/wQIMAYBAf8CAQAwDgYDVR0PAQH/BAQDAgEGMCIGA1UdEgQbMBmGF2h0dHBzOi8vd2FsbGV0LmEtc2l0LmF0MDIGA1UdHwQrMCkwJ6AloCOGIWh0dHBzOi8vd2FsbGV0LmEtc2l0LmF0L2NybC8xLmNybDAfBgNVHSMEGDAWgBSDGoj0XuXE3qEVTmPvKSvIvR36ijAdBgNVHQ4EFgQUgxqI9F7lxN6hFU5j7ykryL0d+oowCgYIKoZIzj0EAwIDRwAwRAIgS9XcYA4Be5gDIdHmMOgJ3AeS44gT4bgVgsg/D5+WXS8CIAxJgi3nhGrVMj9SszehLorR2rR5FO5RZgITAaOIGSNP'
    },
    {
      name: 'ca_ca_r_be_zetes_000.pem',
      certificate:
        'MIICNzCCAb2gAwIBAgIRAJ6Pfw71u8REXgOO+UZhRhEwCgYIKoZIzj0EAwMwIjELMAkGA1UEBhMCQkUxEzARBgNVBAMMClRlc3QgSUEgQ0EwHhcNMjIwMzEwMjAxNjIzWhcNNDIwMzEwMjAxNjIzWjAiMQswCQYDVQQGEwJCRTETMBEGA1UEAwwKVGVzdCBJQSBDQTB2MBAGByqGSM49AgEGBSuBBAAiA2IABMvGPCxoVAcG93w8spIbUmsJLH8EEOxR93q/VJV/PS5qIgZpRoRKQBntqKglE5jBMAeagfCSFliK+kcaR3FwD7Oha7w+Ir0OZxOXSMF6wuwJDDgwqUtIhJbU6VbJGayE2KOBtjCBszASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUD5rkveRIGZGgm5ya+2/PpVp8DTowHwYDVR0jBBgwFoAUD5rkveRIGZGgm5ya+2/PpVp8DTowNAYDVR0fBC0wKzApoCegJYYjaHR0cDovL2hvbWUuc2NhcmxldC5iZS9zdGgvaWFjYS5jcmwwFwYDVR0SBBAwDoEMaWFjYUB0ZXN0LmJlMAoGCCqGSM49BAMDA2gAMGUCMQCJHlAiDlppRIAnxrmQ9rJwIgO1yc1DX917kuuWUuRg5loJ1GtobNVwEvNMJ2YURy8CMAErcYsI4Cz/0s/kJwRX4nuTiF5LkANa5rRlVCT8q6N8SbOwNy54qAUa3wtuvaCkwg=='
    },
    {
      name: 'ca_ca_r_cz_dia_000.pem',
      certificate:
        'MIICmzCCAiKgAwIBAgIEZt3nRjAKBggqhkjOPQQDAjCBhDELMAkGA1UEBhMCQ1oxDjAMBgNVBAgMBVByYWhhMQ4wDAYDVQQHDAVQcmFoYTEQMA4GA1UECgwHQXJpY29tYTEaMBgGA1UECgwRQmFua292bmkgaWRlbnRpdGExJzAlBgNVBAMMHk5hdGlvbmFsIFdhbGxldCBUZXN0aW5nIElzc3VlcjAeFw0yNDA5MDgxODA0NTRaFw00NDA5MDgxODA0NTRaMIGEMQswCQYDVQQGEwJDWjEOMAwGA1UECAwFUHJhaGExDjAMBgNVBAcMBVByYWhhMRAwDgYDVQQKDAdBcmljb21hMRowGAYDVQQKDBFCYW5rb3ZuaSBpZGVudGl0YTEnMCUGA1UEAwweTmF0aW9uYWwgV2FsbGV0IFRlc3RpbmcgSXNzdWVyMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAETg/WU0HTyECqvL5pyCFSPyu6LvWuBdJwkrfh4KqTgiLQNuPJd7FhV8jgXICmykgG0+MZ2WQZ7fmK4UCPTUmXxs84EIc9wwsBMcnr1JgcyjX/1lnm67t49Z/gwfVL8p4oo2MwYTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjAfBgNVHSMEGDAWgBTgEzL+NGwsgG1I11CJtvra7tVW6jAdBgNVHQ4EFgQU4BMy/jRsLIBtSNdQibb62u7VVuowCgYIKoZIzj0EAwIDZwAwZAIwcCCIEor0G+SjeDGhqCExnApdok1H7uYObolvIZGkVkLAPAdbS/bWl9p1WDgwbiFNAjABw15A6ew0c+nTztfdG7ybjzX7c3rsnLBqa93q/+2h51vNEvxHeDhiauA8nDP6HvA='
    },
    {
      name: 'ca_ca_r_de_animo_000.pem',
      certificate:
        'MIIBzzCCAXWgAwIBAgIQVwAFolWQim94gmyCic3bCTAKBggqhkjOPQQDAjAdMQ4wDAYDVQQDEwVBbmltbzELMAkGA1UEBhMCTkwwHhcNMjQwNTAyMTQyMzMwWhcNMjgwNTAyMTQyMzMwWjAdMQ4wDAYDVQQDEwVBbmltbzELMAkGA1UEBhMCTkwwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQC/YyBpcRQX8ZXpHfra1TNdSbS7qzgHYHJ3msbIr8TJLPNZI8Ul8zJlFdQVIVls5+5ClCbN+J9FUvhPGs4AzA+o4GWMIGTMB0GA1UdDgQWBBQv3zBo1i/1CfEgdvkIWDGO9lS1SzAOBgNVHQ8BAf8EBAMCAQYwIQYDVR0SBBowGIYWaHR0cHM6Ly9mdW5rZS5hbmltby5pZDASBgNVHRMBAf8ECDAGAQH/AgEAMCsGA1UdHwQkMCIwIKAeoByGGmh0dHBzOi8vZnVua2UuYW5pbW8uaWQvY3JsMAoGCCqGSM49BAMCA0gAMEUCIQCTg80AmqVHJLaZt2uuhAtPqKIXafP2ghtd9OCmdD51ZwIgKvVkrgTYlxSRAbmKY6MlkH8mM3SNcnEJk9fGVwJG++0='
    },
    {
      name: 'ca_ca_r_de_lapid_000.pem',
      certificate:
        'MIIDUzCCAvqgAwIBAgIIEJwOS9viWVowCgYIKoZIzj0EAwIwbTELMAkGA1UEBhMCREUxHDAaBgNVBAgTE05vcmRyaGVpbi1XZXN0ZmFsZW4xEDAOBgNVBAcTB05ldHBoZW4xGzAZBgNVBAoTEkxhcElEIFNlcnZpY2UgR21iSDERMA8GA1UEAxMIbGFwaWQuZGUwHhcNMjUwNjI3MTUwNjAwWhcNMzUwNjI3MTUwNjAwWjBtMQswCQYDVQQGEwJERTEcMBoGA1UECBMTTm9yZHJoZWluLVdlc3RmYWxlbjEQMA4GA1UEBxMHTmV0cGhlbjEbMBkGA1UEChMSTGFwSUQgU2VydmljZSBHbWJIMREwDwYDVQQDEwhsYXBpZC5kZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGjv5WwRe2H7xS7YF0B0qGXyA3o8Ds/CxcdBK8QyWHLcrngw70mF/1c6bPkGssoOPKTtNqD+rq5W1w7TrXh21DqjggGCMIIBfjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBTlfcboYdSaKjeC0Y7N5QflO0S6FzAOBgNVHQ8BAf8EBAMCAQYwWQYDVR0RBFIwUIIIbGFwaWQuZGWCC2xhcGlkZGV2LmRlggxsYXBpZHRlc3QuZGWCCioubGFwaWQuZGWCDSoubGFwaWRkZXYuZGWCDioubGFwaWR0ZXN0LmRlMCUGA1UdEgQeMByCCGxhcGlkLmRlhhBodHRwczovL2xhcGlkLmRlMIG2BgNVHR8Ega4wgaswU6BRoE+GTWh0dHA6Ly9tZWRpYS5sYXBpZC5kZS9zaGFyZS9lbnR3aWNrbHVuZy9jZXJ0aWZpY2F0ZXMvY2FfY2Ffcl9kZV9sYXBpZF8wMDAuY3JsMFSgUqBQhk5odHRwczovL21lZGlhLmxhcGlkLmRlL3NoYXJlL2VudHdpY2tsdW5nL2NlcnRpZmljYXRlcy9jYV9jYV9yX2RlX2xhcGlkXzAwMC5jcmwwCgYIKoZIzj0EAwIDRwAwRAIgUrY+CTWdCIQRFD2Zmm/aUGV8SavZ2VltmdwKzl7B9gcCICAougCYFMfxe4kSjIOcMfV/u+cG3wrF5HzHSQx2qK15'
    },
    {
      name: 'ca_ca_r_fr_ts_000.pem',
      certificate:
        'MIIChjCCAiygAwIBAgIJAXMkcRe/bYHSMAoGCCqGSM49BAMCMFAxCzAJBgNVBAYTAlVTMQwwCgYDVQQKDANISUQxDDAKBgNVBAsMA0NJRDEVMBMGA1UEAwwMZ29JRFJlYWRlckNBMQ4wDAYDVQQIDAVVUy1UWDAeFw0yNDEyMzEwMDAwMDBaFw0zMzEyMzEyMzU5NTlaMFAxCzAJBgNVBAYTAlVTMQwwCgYDVQQKDANISUQxDDAKBgNVBAsMA0NJRDEVMBMGA1UEAwwMZ29JRFJlYWRlckNBMQ4wDAYDVQQIDAVVUy1UWDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABL6MjQtfn8AABrCJ4wY3GT15A6JfREzIN19T4E1SzWODLFcJvG5byH/HjKUcLUIEzRpQGc9G17psya1nj7VySGqjge4wgeswEgYDVR0TAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFJ7FT8uigBjYFYpUTAvznnSJHT1YMCsGA1UdEAQkMCKADzIwMjQxMjMxMDAwMDAwWoEPMjAyOTEyMzEyMzU5NTlaMCQGA1UdEgQdMBuGGWh0dHA6Ly93d3cuaGlkZ2xvYmFsLmNvbS8wUwYDVR0fBEwwSjBIoEagRIZCaHR0cHM6Ly9kZXYtbHMuZ29pZGh1Yi5oaWRjbG91ZC5jb20vY2lkL2hpZHRlc3RyZWFkZXJjYW1kbC5jcmwucGVtMAoGCCqGSM49BAMCA0gAMEUCIQDQIxojdJLkJBVWbNQheee8kYnHGEaY91nMmwuSmY1ZXAIgN2ukdGiAssTovTogqwhWYtGblBThTKeLkBsMugGkRew='
    },
    {
      name: 'ca_ca_r_nl_rdw_001.pem',
      certificate:
        'MIICsTCCAlegAwIBAgILAIjj7OxmhlT2IWIwCgYIKoZIzj0EAwIwdjEWMBQGA1UEAxMNUkRXIFJlYWRlciBDQTEiMCAGA1UECxMZQ2VydGlmaWNhdGlvbiBBdXRob3JpdGllczEMMAoGA1UEChMDUkRXMQswCQYDVQQGEwJOTDEdMBsGA1UEBRMUODhFM0VDRUM2Njg2NTRGNjIxNjIwHhcNMjUwMjI1MDAwMDAwWhcNMjgwNTI3MDAwMDAwWjB2MRYwFAYDVQQDEw1SRFcgUmVhZGVyIENBMSIwIAYDVQQLExlDZXJ0aWZpY2F0aW9uIEF1dGhvcml0aWVzMQwwCgYDVQQKEwNSRFcxCzAJBgNVBAYTAk5MMR0wGwYDVQQFExQ4OEUzRUNFQzY2ODY1NEY2MjE2MjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGeMyYcQfu1d0RUp19ek0rJgJgIYWWwOr3exhHyKPXDGyR32NjGh88WFhOut7OvS+otuaDX5rAfWnjSVk6HBRtijgcswgcgwHQYDVR0OBBYEFOlaiJ8jjNT1/q7LfTORfkA8dSvlMA4GA1UdDwEB/wQEAwIBBjA8BgNVHRIENTAzhhdodHRwOi8vcmR3Lm1kb2Mub25saW5lL4EYcmVhZGVyY2FAcmR3Lm1kb2Mub25saW5lMA8GA1UdEwEB/wQFMAMBAf8wSAYDVR0fBEEwPzA9oDugOYY3aHR0cDovL3Jkdy5tZG9jLm9ubGluZS9yZWFkZXJjYS9jcmwvUkRXVGVzdFJlYWRlckNBLmNybDAKBggqhkjOPQQDAgNIADBFAiAhA12GNekbPN6xUMy3RAOqe2EiyCR48+ECy6YjMHRPMQIhAMEHWEwNlEI8DjmKoY8Dmp7qe+GNNLAH1qdSeoXnnOqp'
    },
    {
      name: 'ca_int0_r_de_bdr_000.cer',
      certificate:
        'MIICJjCCAcugAwIBAgIEZIx37TAKBggqhkjOPQQDAjA9MQswCQYDVQQGEwJERTEuMCwGA1UEAwwlQkRSIElBQ0EgSVNPL0lFQyAxODAxMy01IHYxIFRFU1QtT05MWTAeFw0yMzA2MTYxNDU1NDFaFw0yNjAxMDkxNTU1NDFaMDsxCzAJBgNVBAYTAkRFMSwwKgYDVQQDDCNCRFIgUkEgSVNPL0lFQyAxODAxMy01IHYxIFRFU1QtT05MWTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABF9I/Y5WlD+o8ybixbH9LgVnSTcEWZLlAKoNAhvLnS2URohqo4BZlGl0R7NjKzWAgymzOXlPC+9ZbflkVaPwEAKjgbowgbcwDgYDVR0PAQH/BAQDAgeAMBUGA1UdJQEB/wQLMAkGByiBjF0FAQYwKQYDVR0fBCIwIDAeoBygGoIYbWRscmVhZGVyLmV4YW1wbGUuYmRyLmRlMCMGA1UdEgQcMBqBGG1kbHJlYWRlci1leGFtcGxlQGJkci5kZTAfBgNVHSMEGDAWgBSXilc0iP8JIzugH955g5vhJylAaTAdBgNVHQ4EFgQU4bGLrDhJQ3utJO3g6T2Stz/sbNYwCgYIKoZIzj0EAwIDSQAwRgIhALPNDAlc31vul76TZfmbwDzLhP8GHSwxh43DMpL2fdExAiEAhdPB1A0Ld3BM12QX8OuuiXtmip6gJfPmJ3vX42jOPKc='
    },
    {
      name: 'ca_int0_r_fr_ingrp_256.pem',
      certificate:
        'MIICCjCCAbCgAwIBAgIBTzAKBggqhkjOPQQDAjAcMQswCQYDVQQGEwJGUjENMAsGA1UEAwwEcm9vdDAeFw0yNTAyMTcyMDM2NTFaFw0yNzAyMTcyMDM2NTFaMCQxCzAJBgNVBAYTAkZSMRUwEwYDVQQDDAxpbnRlcm1lZGlhdGUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATxwXIulDwLpyJaUF8i9Ae658V3DLEs2CJTSSYEkWWVWxmbdEnUkOpHjwZEX8jbnM8Wjkve1ilNzxUkDxyfKAWGo4HaMIHXMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFGF7oT2CwWFRngLhhLWFS5GFqK5VMB8GA1UdIwQYMBaAFDFaPsDY6Z2b9oaJR/QL/xnrcnHBMAsGA1UdDwQEAwIBhjASBgNVHSUECzAJBgcogYxdBQEGMBcGA1UdEQQQMA6CDGludGVybWVkaWF0ZTBHBgNVHR8EQDA+MDygOqA4hjZodHRwczovL3BpZC12ZXJpZmllci51dG9jb25uZWN0LmNvbS90cnVzdHN0cnVjdHVyZS9jcmwwCgYIKoZIzj0EAwIDSAAwRQIhAIeBwNK0QZ5Zf6KxbOxBIJ7xJKRVsRqG2loyuTvxyB4nAiBv9EWAowBlVoKnSD4bQqYNdZjgBkdblukBqVAqrKLlEA=='
    },
    {
      name: 'ca_root_r_fr_ingrp_256.pem',
      certificate:
        'MIIB+DCCAZ2gAwIBAgIBTjAKBggqhkjOPQQDAjAcMQswCQYDVQQGEwJGUjENMAsGA1UEAwwEcm9vdDAeFw0yNTAyMTcyMDM2NDdaFw0yODAyMTcyMDM2NDdaMBwxCzAJBgNVBAYTAkZSMQ0wCwYDVQQDDARyb290MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEN0M6sAKibKhNwPQ3qAWKpNPzOS1jwlyJ36oPlWNQoHuHnUb7GiMAO8xLRpZFnBRbvICo+i3hzEkSg0ys9UyRRqOBzzCBzDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQxWj7A2Omdm/aGiUf0C/8Z63JxwTAfBgNVHSMEGDAWgBQxWj7A2Omdm/aGiUf0C/8Z63JxwTALBgNVHQ8EBAMCAYYwEgYDVR0lBAswCQYHKIGMXQUBBjAPBgNVHREECDAGggRyb290MEcGA1UdHwRAMD4wPKA6oDiGNmh0dHBzOi8vcGlkLXZlcmlmaWVyLnV0b2Nvbm5lY3QuY29tL3RydXN0c3RydWN0dXJlL2NybDAKBggqhkjOPQQDAgNJADBGAiEAwoBHvaryqo63nH54nYe8wUYzhwBKs6aQzWv1+fx1unQCIQC1iKrgWfSDMPUBeSHY89UOspGIpEB1ayYawuWQUNxLEA=='
    },
    {
      name: 'crt_r_ie_nf_000.pem',
      certificate:
        'MIIDJDCCAsqgAwIBAgIUUNkFYPpaLFcboeQT9fDWcTNFHgMwCgYIKoZIzj0EAwIwYTELMAkGA1UEBhMCSUUxOzA5BgNVBAoMMk9mZmljZSBvZiB0aGUgR292ZXJubWVudCBDaGllZiBJbmZvcm1hdGlvbiBPZmZpY2VyMRUwEwYDVQQDDAxvZ2Npby5nb3YuaWUwHhcNMjUwNDA3MTUzMDI2WhcNMjYwNDA3MTUzMDI2WjA/MTAwLgYDVQQDEydPR0NJTyBEaWdpdGFsIENyZWRlbnRpYWwgVmVyaWZpZXIgQWdlbnQxCzAJBgNVBAYTAklFMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEBgGc8C2ERZ5pduC7uhEiNBh/TAvG0dLD/zRfaUBf853jLHMRbnAnSATQUbyrD2RG5MNk8uAdcHxWO0UfESN+d6OCAYAwggF8MA4GA1UdDwEB/wQEAwIBpjB4BgNVHR8EcTBvMG2ga6BphmdodHRwczovL2FnZW50cy5wcm9kLmRpZ2l0YWwtd2FsbGV0Lmdvdi5pZS9hcGkvY29yZS92MS90cnVzdC94NTA5L2NlcnRpZmljYXRlLXJldm9jYXRpb24tbGlzdHMvT0dDSU8uY3JsMBIGA1UdEwEB/wQIMAYBAf8CAQAwbgYDVR0SBGcwZYZjaHR0cHM6Ly9hZ2VudHMucHJvZC5kaWdpdGFsLXdhbGxldC5nb3YuaWUvYXBpL2NvcmUvdjEvdmVyaWZpZXIvNmJiNTgyODAtMTM3MC00NzE4LThlY2EtOWFkYjcwM2ZjYTcxMCwGA1UdEQQlMCOCIWFnZW50cy5wcm9kLmRpZ2l0YWwtd2FsbGV0Lmdvdi5pZTAdBgNVHQ4EFgQUTgG3K7Sk2kjqOYWgKl2PcvjSTOIwHwYDVR0jBBgwFoAUiwLT/WLVcNaPQBSwOk5rG3y9y8swCgYIKoZIzj0EAwIDSAAwRQIhAJNFZay/yTSH3/4uZ6YiqXdQBGopq78F3/zQYuBbuAHSAiAO6qGiejkyA3EmFy6jSwxDwlnN2uql035LNPvkg7B//Q=='
    },
    {
      name: 'crt_r_ie_nf_001.pem',
      certificate:
        'MIIDGzCCAsCgAwIBAgIUT/ZgLJe2t6Ugx4W15L5IlNbx9tQwCgYIKoZIzj0EAwIwYTELMAkGA1UEBhMCSUUxOzA5BgNVBAoMMk9mZmljZSBvZiB0aGUgR292ZXJubWVudCBDaGllZiBJbmZvcm1hdGlvbiBPZmZpY2VyMRUwEwYDVQQDDAxvZ2Npby5nb3YuaWUwHhcNMjUwNjI3MTUyODIzWhcNMjYwNjI3MTUyODIzWjBhMQswCQYDVQQGEwJJRTE7MDkGA1UEChMyT2ZmaWNlIG9mIHRoZSBHb3Zlcm5tZW50IENoaWVmIEluZm9ybWF0aW9uIE9mZmljZXIxFTATBgNVBAMTDG9nY2lvLmdvdi5pZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABAYBnPAthEWeaXbgu7oRIjQYf0wLxtHSw/80X2lAX/Od4yxzEW5wJ0gE0FG8qw9kRuTDZPLgHXB8VjtFHxEjfnejggFUMIIBUDAOBgNVHQ8BAf8EBAMCAaYweAYDVR0fBHEwbzBtoGugaYZnaHR0cHM6Ly9hZ2VudHMucHJvZC5kaWdpdGFsLXdhbGxldC5nb3YuaWUvYXBpL2NvcmUvdjEvdHJ1c3QveDUwOS9jZXJ0aWZpY2F0ZS1yZXZvY2F0aW9uLWxpc3RzL09HQ0lPLmNybDASBgNVHRMBAf8ECDAGAQH/AgEAMFoGA1UdEgRTMFGGT2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvY29yZS92MS92ZXJpZmllci82YmI1ODI4MC0xMzcwLTQ3MTgtOGVjYS05YWRiNzAzZmNhNzEwFAYDVR0RBA0wC4IJbG9jYWxob3N0MB0GA1UdDgQWBBROAbcrtKTaSOo5haAqXY9y+NJM4jAfBgNVHSMEGDAWgBRUMsxIr3AwZ8OQc5pwWoBgcI/jxTAKBggqhkjOPQQDAgNJADBGAiEA50pRxujRY7nwQbyq7B5lSuhjWQMuVA02MJ0EYtiw99oCIQC3A4I9d36+6AxiQrvFJcT1cUGp1cp8YbxyIQ23/tgP4w=='
    },
    {
      name: 'crt_r_ie_nf_002.pem',
      certificate:
        'MIIDHjCCAsWgAwIBAgIUHnBGMlSSClbcweWeaQWuSwOf9oYwCgYIKoZIzj0EAwIwYTELMAkGA1UEBhMCSUUxOzA5BgNVBAoMMk9mZmljZSBvZiB0aGUgR292ZXJubWVudCBDaGllZiBJbmZvcm1hdGlvbiBPZmZpY2VyMRUwEwYDVQQDDAxvZ2Npby5nb3YuaWUwHhcNMjUwNjI3MTU0NTA2WhcNMjYwNjI3MTU0NTA2WjBhMQswCQYDVQQGEwJJRTE7MDkGA1UEChMyT2ZmaWNlIG9mIHRoZSBHb3Zlcm5tZW50IENoaWVmIEluZm9ybWF0aW9uIE9mZmljZXIxFTATBgNVBAMTDG9nY2lvLmdvdi5pZTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCELlT+AMDCnAJ1dr3zictDzLXwr7sH0WuIX10eP18kV0080cXNuHJVh4Qtb4ztYhctfLL9DyuSNDHA9v8Ei3TijggFZMIIBVTAOBgNVHQ8BAf8EBAMCAaYweAYDVR0fBHEwbzBtoGugaYZnaHR0cHM6Ly9hZ2VudHMucHJvZC5kaWdpdGFsLXdhbGxldC5nb3YuaWUvYXBpL2NvcmUvdjEvdHJ1c3QveDUwOS9jZXJ0aWZpY2F0ZS1yZXZvY2F0aW9uLWxpc3RzL09HQ0lPLmNybDASBgNVHRMBAf8ECDAGAQH/AgEAMFoGA1UdEgRTMFGGT2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvY29yZS92MS92ZXJpZmllci8wMzZhNjFmMy1iZjBlLTRhNTktODgyZC03ODM5MDQ3N2ZlMGQwGQYDVR0RBBIwEIIObG9jYWxob3N0OjMwMDAwHQYDVR0OBBYEFCPC8pG7kih9+vN4+gle18JiPcHmMB8GA1UdIwQYMBaAFFQyzEivcDBnw5BzmnBagGBwj+PFMAoGCCqGSM49BAMCA0cAMEQCIAXFOrUeeS4g1UEsqHGnRl6bhN0DeSxRe01hMNvBAGoHAiBAlWW9+c4AY2fc09fkeQBVpra7wuSp2RWTwTjLd4vFfQ=='
    },
    {
      name: 'crt_r_jp_pco_000.pem',
      certificate:
        'MIICmTCCAh+gAwIBAgIUH/6YL7/PWs/752iUkqNFOQPcPW8wCgYIKoZIzj0EAwMwLjEfMB0GA1UEAwwWUGFuYXNvbmljIENvbm5lY3QgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwNDAxMDIyNDIzWhcNMjYwNDAxMDIyNDIyWjAwMSEwHwYDVQQDDBhQYW5hc29uaWMgQ29ubmVjdCBSZWFkZXIxCzAJBgNVBAYTAkpQMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEng2ofedpbweVUMmx/m+DhrmnrO8LIUCbjPQbX3RTk22ujY0opPj4HCK1IFeY/G/KjRxSH8ogtS4eBVcoFymQA6OCARcwggETMB8GA1UdIwQYMBaAFBCw8Jh47C0RXrGmPCI6AlPBjEyNMDAGA1UdEQQpMCeCJW1kbHBpbG90LmphcGFuZWFzdC5jbG91ZGFwcC5henVyZS5jb20wFQYDVR0lAQH/BAswCQYHKIGMXQUBBjBMBgNVHR8ERTBDMEGgP6A9hjtodHRwczovL21kbHBpbG90LmphcGFuZWFzdC5jbG91ZGFwcC5henVyZS5jb20vQ1JMcy9tZG9jLmNybDAdBgNVHQ4EFgQU6O8xrzRWp8PGOqQkctRMfgdpsjswDgYDVR0PAQH/BAQDAgeAMCoGA1UdEgQjMCGGH2h0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L21kb2MwCgYIKoZIzj0EAwMDaAAwZQIxAJMOpXIW3R1fKtCtp1iDjV1d6uuVVSaOidzblJBYDIDjA40NrjIdqh62e4a7o3RvVwIwK6KvFlVOHVHFf81Qe8h7TkgrBzwnAHrL6uYbwxCBxcySl1Zafl9LJ921uKZ/4BWB'
    },
    {
      name: 'verifier.pem',
      certificate:
        'MIIDQDCCAsWgAwIBAgIUcf8YCs0YaZgITuJBKkGwDJMX2IEwCgYIKoZIzj0EAwIwXDEeMBwGA1UEAwwVUElEIElzc3VlciBDQSAtIFVUIDAxMS0wKwYDVQQKDCRFVURJIFdhbGxldCBSZWZlcmVuY2UgSW1wbGVtZW50YXRpb24xCzAJBgNVBAYTAlVUMB4XDTI1MDIyNDExMzEzOFoXDTI3MDIyNDExMzEzN1owazEnMCUGA1UEAwwec25mLTg5NTc5OC52bS5va2Vhbm9zLmdybmV0LmdyMQowCAYDVQQFEwExMScwJQYDVQQKDB5zbmYtODk1Nzk4LnZtLm9rZWFub3MuZ3JuZXQuZ3IxCzAJBgNVBAYTAlVUMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3gV4rbiahRGvTCOMEmJCmt5Xiy84aYIc4RzbpXhWCpdKJ/RL5EZhOf7sx4hx6+syWZnDVweE+B+msDiSNxR09KOCAVQwggFQMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUs2y4kRcc16QaZjGHQuGLwEDMlRswOAYDVR0RBDEwL4ENaW5mb0Bncm5ldC5ncoIec25mLTg5NTc5OC52bS5va2Vhbm9zLmdybmV0LmdyMBIGA1UdJQQLMAkGByiBjF0FAQYwQwYDVR0fBDwwOjA4oDagNIYyaHR0cHM6Ly9wcmVwcm9kLnBraS5ldWRpdy5kZXYvY3JsL3BpZF9DQV9VVF8wMS5jcmwwHQYDVR0OBBYEFEPv6pyqDXi0pNOymcgyJrC0EOTyMA4GA1UdDwEB/wQEAwIHgDBdBgNVHRIEVjBUhlJodHRwczovL2dpdGh1Yi5jb20vZXUtZGlnaXRhbC1pZGVudGl0eS13YWxsZXQvYXJjaGl0ZWN0dXJlLWFuZC1yZWZlcmVuY2UtZnJhbWV3b3JrMAoGCCqGSM49BAMCA2kAMGYCMQCKoFhI4NaCTulOOga1Nk7MKBi3OPyD+a2ZdDS5mf1CCuPjMtOXYv2EsExtg3fHYUwCMQD43TcJY2iC6tUw5lGopfwSPEgXUm4fgXXGbJgIml0EAXx934wL6hG+53gA5aGp4Q0='
    },
    {
      name: 'verifier_oid4vp24.pem',
      certificate:
        'MIIDQDCCAsWgAwIBAgIUeSZZnBGkt6IEmakWirXzaPa1st0wCgYIKoZIzj0EAwIwXDEeMBwGA1UEAwwVUElEIElzc3VlciBDQSAtIFVUIDAxMS0wKwYDVQQKDCRFVURJIFdhbGxldCBSZWZlcmVuY2UgSW1wbGVtZW50YXRpb24xCzAJBgNVBAYTAlVUMB4XDTI1MDQwODE5MDQyNFoXDTI3MDQwODE5MDQyM1owazEnMCUGA1UEAwwec25mLTg5NjIyOC52bS5va2Vhbm9zLmdybmV0LmdyMQowCAYDVQQFEwExMScwJQYDVQQKDB5zbmYtODk2MjI4LnZtLm9rZWFub3MuZ3JuZXQuZ3IxCzAJBgNVBAYTAlVUMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEvDq57GzoBrk0y6vW0gFAijdZgeeCgWnsd/FuV/SATKdhWLgoTxBfrNXyNBwWyhYui8B1RwsmavmIlFlOVnlSZaOCAVQwggFQMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUs2y4kRcc16QaZjGHQuGLwEDMlRswOAYDVR0RBDEwL4ENaW5mb0Bncm5ldC5ncoIec25mLTg5NjIyOC52bS5va2Vhbm9zLmdybmV0LmdyMBIGA1UdJQQLMAkGByiBjF0FAQYwQwYDVR0fBDwwOjA4oDagNIYyaHR0cHM6Ly9wcmVwcm9kLnBraS5ldWRpdy5kZXYvY3JsL3BpZF9DQV9VVF8wMS5jcmwwHQYDVR0OBBYEFE/Wo3GNFsAt8gZhZ0V44OlPFcypMA4GA1UdDwEB/wQEAwIHgDBdBgNVHRIEVjBUhlJodHRwczovL2dpdGh1Yi5jb20vZXUtZGlnaXRhbC1pZGVudGl0eS13YWxsZXQvYXJjaGl0ZWN0dXJlLWFuZC1yZWZlcmVuY2UtZnJhbWV3b3JrMAoGCCqGSM49BAMCA2kAMGYCMQDS7ALM46DTEJmal5QEFu3/nborud3w7p8GjHI4q4WeIWNqhTEvf61+0QYSjggs2m8CMQCFs5PkkLbvDL0AenZ5KLJk38Ew3Ik6Y5OHj/UYC4tH9MG06A1QGYBoRdiUJGT2XM8='
    }
  ];
