import { Divider } from '@pagopa/io-app-design-system';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ParsedClaimsRecord } from '../../utils/claims';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredentialMetadata;
  parsedClaims: ParsedClaimsRecord;
};

export const ItwPresentationClaimsSection = ({
  credential,
  parsedClaims
}: ItwPresentationClaimsSectionProps) => {
  const { t } = useTranslation(['common']);

  const credentialStatus = useMemo(
    () => getCredentialStatus(credential),
    [credential]
  );

  const claims = useMemo(() => Object.entries(parsedClaims), [parsedClaims]);

  return (
    <View>
      {claims.map(([, claim], index) => (
        <Fragment key={index}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim
            claim={claim}
            clipboardSuccessMessage={t('clipboard.copyFeedback')}
            credentialStatus={credentialStatus}
            isPreview={false}
            showLabel={t('buttons.show')}
          />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
    </View>
  );
};
