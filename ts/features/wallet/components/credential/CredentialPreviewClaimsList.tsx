import { Divider } from '@pagopa/io-app-design-system';
import { View } from 'react-native';
import { ItwCredentialClaim } from './ItwCredentialClaim';
import { ParsedClaimsRecord } from '../../utils/claims';

type CredentialClaimsListProps = {
  claims: ParsedClaimsRecord;
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
    {Object.values(claims).map((elem, index) => (
      <View key={index}>
        <ItwCredentialClaim claim={elem} isPreview={isPreview} />
        {index < Object.values(claims).length - 1 && <Divider />}
      </View>
    ))}
  </>
);

export default CredentialPreviewClaimsList;
