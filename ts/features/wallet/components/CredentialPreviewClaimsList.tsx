import {Divider} from '@pagopa/io-app-design-system';
import React from 'react';
import {View} from 'react-native';
import {StoredCredential} from '../utils/types';
import {parseClaims} from '../utils/claims';
import {CredentialClaim} from './CredentialClaims';

type CredentialClaimsListProps = {
  data: StoredCredential;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 */
const CredentialPreviewClaimsList = ({data}: CredentialClaimsListProps) => {
  const claims = parseClaims(data.parsedCredential);

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <CredentialClaim claim={elem} />
          {index < claims.length - 1 && <Divider />}
        </View>
      ))}
    </>
  );
};

export default CredentialPreviewClaimsList;
