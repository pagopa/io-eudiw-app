import {
  ListItemHeader,
  useIOTheme,
  VStack
} from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ItwClaimsSelector } from '../../components/presentation/ItwClaimsSelector';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = {
  claimsToDisplay: ClaimDisplayFormat[];
  credentialType: string;
  rpId: string;
}[];

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => {
  const theme = useIOTheme();
  const { t } = useTranslation();

  return (
    <View>
      <ListItemHeader
        iconColor={theme['icon-decorative']}
        iconName="security"
        label={t('presentation.trust.requiredClaims', { ns: 'wallet' })}
      />
      <VStack space={24}>
        {data.map(({ claimsToDisplay, credentialType }) => (
          <ItwClaimsSelector
            credentialType={credentialType}
            defaultExpanded
            items={claimsToDisplay}
            key={credentialType}
          />
        ))}
      </VStack>
    </View>
  );
};

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
