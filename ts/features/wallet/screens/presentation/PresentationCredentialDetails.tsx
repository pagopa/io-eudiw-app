import { ContentWrapper, VSpacer } from '@pagopa/io-app-design-system';
import { StackScreenProps } from '@react-navigation/stack';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { useAppSelector } from '../../../../store';
import { selectCredential } from '../../store/credentials';

import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { PresentationDetailsScreenBase } from '../../components/presentation/PresentationDetailsScreenBase';
import { PresentationDetailsHeader } from '../../components/presentation/PresentationDetailsHeader';
import { PresentationDetailsFooter } from '../../components/presentation/PresentationDetailsFooter';
import { StoredCredential } from '../../utils/itwTypesUtils';
import CredentialNotFound from './PresentationCredentialNotFound';

export type PresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_DETAILS'
>;

/**
 * Component that renders the credential detail screen.
 */
export const PresentationCredentialDetails = ({ route }: Props) => {
  const { credentialType } = route.params;
  const credential = useAppSelector(selectCredential(credentialType));

  if (!credential) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <CredentialNotFound credentialType={credentialType} />;
  }

  return <PresentationCredentialDetail credential={credential} />;
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredential;
};

/**
 * Component that renders the credential detail content.
 */
const PresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  useDebugInfo(credential);

  return (
    <PresentationDetailsScreenBase credential={credential}>
      <PresentationDetailsHeader credential={credential} />
      <VSpacer size={24} />
      <ContentWrapper>
        <CredentialPreviewClaimsList data={credential} isPreview={false} />
        <PresentationDetailsFooter credential={credential} />
      </ContentWrapper>
    </PresentationDetailsScreenBase>
  );
};
