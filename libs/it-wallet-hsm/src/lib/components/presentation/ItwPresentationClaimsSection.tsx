import { Divider } from '@pagopa/io-app-design-system';
import { Fragment, useMemo } from 'react';
import { View } from 'react-native';

import { ParsedClaimsRecord } from '../../utils/claims';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';

type ItwPresentationClaimsSectionProps = {
  parsedClaims: ParsedClaimsRecord;
};

export const ItwPresentationClaimsSection = ({
  parsedClaims
}: ItwPresentationClaimsSectionProps) => {
  const claims = useMemo(() => Object.values(parsedClaims), [parsedClaims]);

  return (
    <View>
      {claims.map((claim, index) => (
        <Fragment key={index}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={claim} />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
    </View>
  );
};
