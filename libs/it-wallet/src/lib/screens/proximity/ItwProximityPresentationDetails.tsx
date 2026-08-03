import { getSafeText } from '@io-eudiw-app/commons';
import {
  ClaimsSelector,
  ListItemHeader,
  useIOTheme,
  VStack
} from '@pagopa/io-app-design-system';
import { addPadding } from '@pagopa/io-react-native-jwt';
import { ComponentProps, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  getClaimDisplayValue,
  WellKnownClaim
} from '../../utils/itwClaimsUtils';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';

/**
 * Maps claims to the format required by the ClaimsSelector component.
 */
const mapClaims = (
  claims: ClaimDisplayFormat[]
): ComponentProps<typeof ClaimsSelector>['items'] =>
  claims.map(c => {
    const displayResult = getClaimDisplayValue(c);

    if (displayResult.type === 'image') {
      return {
        description: c.label,
        id: c.id,
        type: 'image',
        value: displayResult.value
      };
    }

    if (
      (c.id.includes(WellKnownClaim.portrait) ||
        c.id.includes(WellKnownClaim.signature_usual_mark)) &&
      typeof displayResult.value === 'string'
    ) {
      return {
        description: c.label,
        id: c.id,
        type: 'image',
        value: `data:image/jpeg;base64,${addPadding(displayResult.value)}`
      };
    }

    const textValue = Array.isArray(displayResult.value)
      ? displayResult.value.map(getSafeText).join(', ')
      : getSafeText(displayResult.value);

    return {
      description: c.label,
      id: c.id,
      value: textValue
    };
  });

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
          <ClaimsSelector
            defaultExpanded
            items={mapClaims(claimsToDisplay)}
            key={credentialType}
            selectionEnabled={false}
            title={getCredentialNameFromType(credentialType)}
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
