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
