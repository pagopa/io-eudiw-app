import {
  VerifierRequest,
  AcceptedFields
} from '@pagopa/io-react-native-proximity';
import {wellKnownCredential} from './credentials';
import {StoredCredential} from './types';

/**
 * This function generates the accepted fields for the VerifierRequest and sets each requested field to true.
 * WARNING: This function is a quick and dirty implementation copied from the proximity example app. It will be replaced in the future.
 * @param request - The request object containing the requested fields
 * @returns A new object with the same structure as the request, but with all values set to true
 */
export const generateAcceptedFields = (
  request: VerifierRequest['request']
): AcceptedFields => {
  // Cycle through the requested credentials
  const result: AcceptedFields = {};
  // eslint-disable-next-line guard-for-in
  for (const credentialKey in request) {
    const credential = request[credentialKey];
    if (!credential) {
      continue;
    }

    // Cycle through the requested namespaces and the isAuthenticated field
    const namespaces: AcceptedFields['credential'] = {};
    for (const namespaceKey in credential) {
      // Skip the isAuthenticated field
      if (!credential[namespaceKey] || namespaceKey === 'isAuthenticated') {
        continue;
      }

      // Cycle through the requested fields and set them to true
      const fields: AcceptedFields['credential']['namespace'] = {};
      // eslint-disable-next-line guard-for-in
      for (const fieldKey in credential[namespaceKey]!) {
        // eslint-disable-next-line functional/immutable-data
        fields[fieldKey] = true;
      }
      // eslint-disable-next-line functional/immutable-data
      namespaces[namespaceKey] = fields;
    }
    // eslint-disable-next-line functional/immutable-data
    result[credentialKey] = namespaces;
  }

  return result;
};

export enum RequestType {
  MDL,
  HEALTHID,
  BOTH
}

/**
 * Utility funciton to check the request type based on the keys of the request object.
 * It currently supports only mDL and HealthID credentials or both.
 * @param requestKeys - The keys of the request object which contains the credential type
 * @returns A RequestType enum value indicating the type of request
 * @throws Error if the request contains multiple keys or if the key is not the mDL credential type
 */
export const getTypeRequest = (requestKeys: Array<string>) => {
  if (
    requestKeys.length === 1 ||
    (requestKeys.length === 2 &&
      requestKeys.every(
        key =>
          key === wellKnownCredential.DRIVING_LICENSE ||
          key === wellKnownCredential.HEALTHID
      ))
  ) {
    if (requestKeys.length === 2) {
      return RequestType.BOTH;
    } else if (requestKeys[0] === wellKnownCredential.HEALTHID) {
      return RequestType.HEALTHID;
    } else if (requestKeys[0] === wellKnownCredential.DRIVING_LICENSE) {
      return RequestType.MDL;
    }
  }

  throw new Error('Unexpected request keys. Expected only mDL or HealthID.');
};

/**
 * Utility functions which filters the documents based on the request type. Currently it supports only mDL and HealthID credentials or both.
 * @param type - The type of request returned by the `getTypeRequest` function
 * @param documents - The array of stored credentials to filter
 * @returns An array of stored credentials that match the request type
 */
export const getDocumentsByRequestType = (
  type: RequestType,
  documents: Array<StoredCredential>
) => {
  switch (type) {
    case RequestType.MDL:
      return documents.filter(
        doc => doc.credentialType === wellKnownCredential.DRIVING_LICENSE
      );
    case RequestType.HEALTHID:
      return documents.filter(
        doc => doc.credentialType === wellKnownCredential.HEALTHID
      );
    case RequestType.BOTH:
      return documents.filter(
        doc =>
          doc.credentialType === wellKnownCredential.DRIVING_LICENSE ||
          doc.credentialType === wellKnownCredential.HEALTHID
      );
    default:
      throw new Error('Unexpected request type');
  }
};
