import {
  VerifierRequest,
  AcceptedFields
} from '@pagopa/io-react-native-proximity';
import {wellKnownCredential} from './credentials';

/**
 * This function generates the accepted fields for the VerifierRequest and sets each requested field to true.
 * @param request - The request object containing the requested fields
 * @returns A new object with the same structure as the request, but with all values set to true
 */
export const generateAcceptedFields = (
  _: VerifierRequest['request']
): AcceptedFields => {
  // TODO implement a more generic solution to generate the accepted fields
  const acceptedFields: AcceptedFields = {
    'org.iso.18013.5.1.mDL': {
      'org.iso.18013.5.1': {
        height: true,
        weight: true,
        portrait: true,
        birth_date: true,
        eye_colour: true,
        given_name: true,
        issue_date: true,
        age_over_18: true,
        age_over_21: true,
        birth_place: true,
        expiry_date: true,
        family_name: false,
        hair_colour: true,
        nationality: true,
        age_in_years: true,
        resident_city: true,
        age_birth_year: true,
        resident_state: true,
        document_number: true,
        issuing_country: true,
        resident_address: true,
        resident_country: true,
        issuing_authority: true,
        driving_privileges: true,
        issuing_jurisdiction: true,
        resident_postal_code: true,
        signature_usual_mark: true,
        administrative_number: true,
        portrait_capture_date: true,
        un_distinguishing_sign: true,
        given_name_national_character: true,
        family_name_national_character: true
      }
    }
  };

  return acceptedFields;
};

/**
 * Utility funciton to check if the request only contains the mDL credential type.
 * @param requestKeys - The keys of the request object which contains the credential type
 * @returns void if the request is valid, otherwise throws an error
 * @throws Error if the request contains multiple keys or if the key is not the mDL credential type
 */
export const isRequestMdl = (requestKeys: Array<string>) => {
  if (requestKeys.length !== 1) {
    throw new Error('Unexpected request keys. Expected only one key.');
  }
  if (requestKeys[0] !== wellKnownCredential.DRIVING_LICENSE) {
    throw new Error('Unexpected request key. Expected only mDL.');
  }
};
