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
const attributesReducerGenerator =
  (credential: StoredCredentialWithIssuerSigned) =>
  (prev: Record<string, ParsedCredential[string]>, attribute: string) => {
    // If the credential contains the attribute, add it to the accumulator
    if (credential.parsedCredential[attribute]) {
      return {
        ...prev,
        [attribute]: credential.parsedCredential[attribute]
      };
    }
    // Go to the next attribute otherwise
    return {...prev};
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
const nameSpaceReducerGenerator =
  (credential: StoredCredentialWithIssuerSigned) =>
  /**
   * @param namespace : A Verifier Request namespace
   * @param attributes : The Verifier requested namespace attributes
   */
  (
    accumulator: Record<string, Record<string, ParsedCredential[string]>>,
    [namespace, attributes]: [string, boolean | Record<string, boolean>]
  ) => {
    // Check first if the credential contains the required namespace
    const foundNamespace = Object.entries(
      credential.issuerSigned.nameSpaces
    ).find(([ns]) => ns === namespace);
    if (foundNamespace) {
      // If found, combine the attributes required for the specific namespace
      // by the Verifier Request with claim values and display info from the credentials,
      // if matches are found
      const foundAttributes = Object.keys(attributes).reduce(
        attributesReducerGenerator(credential),
        {} as Record<string, ParsedCredential[string]>
      );
      if (Object.keys(foundAttributes).length !== 0) {
        // If attribute have been found add the namespace new entry containing attribute
        // values and display data to the accumulator
        return {
          ...accumulator,
          [namespace]: foundAttributes
        };
      } else {
        // If no attribute has been found go to the next namespace
        return {
          ...accumulator
        };
      }
    }
    // If the credential doesn't contain the namespace go to the next one
    return {...accumulator};
  };

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
  Object.entries(request).reduce((accumulator, [credentialType, value]) => {
    // Search for a credential of the same credential type specified in the Verifier Request
    const credential = decodedCredentials.find(
      cred => cred.credentialType === credentialType
    );
    if (credential) {
      // Key : namespace
      // Value : attributes
      const foundNamespaces = Object.entries(value)
        // Filter the isAuthenticated key, which is not a namespace
        .filter(([key, _]) => key !== 'isAuthenticated')
        // Combine the namespaces and attributes required by the Verifier Request with
        // claim values and display info from the credentials, if matches are found
        .reduce(
          nameSpaceReducerGenerator(credential),
          {} as Record<string, Record<string, ParsedCredential[string]>>
        );
      if (Object.keys(foundNamespaces).length === 0) {
        // If no namespace has been found or no attributes in any namespace have been found go to the next Verifier required credential
        return {...accumulator};
      } else {
        // Otherwise add a new entry to the accumulator
        return {
          ...accumulator,
          [credentialType]: foundNamespaces
        };
      }
    }
    // If no matching credential has been found go to the next Verifier required credential
    return {
      ...accumulator
    };
  }, {} as Record<string, Record<string, Record<string, ParsedCredential[string]>>>);

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
