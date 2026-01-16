import { Divider } from '@pagopa/io-app-design-system';
import { View } from 'react-native';
import { ClaimDisplayFormat } from '../../utils/itwTypesUtils';
import { CredentialClaim } from './CredentialClaims';

type CredentialClaimsListProps = {
  claims: Array<ClaimDisplayFormat>;
  isPreview: boolean;
};

/**
 * This component renders the list of claims for a credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * @param claims - the list of claims to display.
 * @param isPreview - if true, the claims won't be rendered with buttons to show the full value
 */
const CredentialPreviewClaimsList = ({
  claims,
  isPreview
}: CredentialClaimsListProps) => (
  <>
    {claims.map((elem, index) => (
      <View key={index}>
        <CredentialClaim claim={elem} isPreview={isPreview} />
        {index < claims.length - 1 && <Divider />}
      </View>
    ))}
  </>
);

export default CredentialPreviewClaimsList;
