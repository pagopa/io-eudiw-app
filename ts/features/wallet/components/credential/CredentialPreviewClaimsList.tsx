import {Divider} from '@pagopa/io-app-design-system';
import React from 'react';
import {View} from 'react-native';
import {StoredCredential} from '../../utils/types';
import {parseClaims} from '../../utils/claims';
import {CredentialClaim} from './CredentialClaims';

type CredentialClaimsListProps = {
  data: StoredCredential;
  isPreview: boolean;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param data - the {@link StoredCredential} of the credential.
 * @param isPreview - if true, the claims are rendered in a compact way.
 */
const CredentialPreviewClaimsList = ({
  data,
  isPreview
}: CredentialClaimsListProps) => {
  const claims = parseClaims(data.parsedCredential);

  return (
    <>
      {claims.map((elem, index) => (
        <View key={index}>
          <CredentialClaim claim={elem} isPreview={isPreview} />
          {index < claims.length - 1 && <Divider />}
        </View>
      ))}
    </>
  );
};

export default CredentialPreviewClaimsList;
