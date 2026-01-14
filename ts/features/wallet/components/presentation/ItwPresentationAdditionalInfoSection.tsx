import { memo } from 'react';
import { StoredCredential } from '../../utils/types';
import { CredentialType } from '../../utils/itwMocksUtils';
import { ItwPresentationNewCredentialValidityAlert } from './ItwPresentationNewCredentialValidityAlert';
import { ItwPresentationFiscalCode } from './ItwPresentationFiscalCode';

type Props = {
  credential: StoredCredential;
};

/**
 * This component returns the additional information required by a credential details screen, which is not
 * part of the credential claims
 */
const ItwPresentationAdditionalInfoSection = ({ credential }: Props) => {
  switch (credential.credentialType) {
    case CredentialType.EDUCATION_DEGREE:
    case CredentialType.EDUCATION_ENROLLMENT:
    case CredentialType.RESIDENCY:
      return (
        <ItwPresentationNewCredentialValidityAlert
          credentialType={credential.credentialType}
        />
      );
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return <ItwPresentationFiscalCode />;
    default:
      return null;
  }
};

const MemoizedItwPresentationAdditionalInfoSection = memo(
  ItwPresentationAdditionalInfoSection
);

export { MemoizedItwPresentationAdditionalInfoSection as ItwPresentationAdditionalInfoSection };
