import { VStack } from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { View } from 'react-native';

import { ItwClaimsSelector } from '../../components/presentation/ItwClaimsSelector';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = {
  claimsToDisplay: ClaimDisplayFormat[];
  credentialType: string;
  rpId?: string;
}[];

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => (
  <View>
    <VStack space={24}>
      {data.map(({ claimsToDisplay, credentialType }) => (
        <ItwClaimsSelector
          credentialType={credentialType}
          defaultExpanded
          items={claimsToDisplay}
          key={credentialType}
          selectionEnabled={false}
        />
      ))}
    </VStack>
  </View>
);

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
