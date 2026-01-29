import { ComponentProps, memo } from 'react';
import { View } from 'react-native';
import {
  ClaimsSelector,
  ListItemHeader,
  VStack,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { addPadding } from '@pagopa/io-react-native-jwt';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';
import { getSafeText } from '../../../../utils/string';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import {
  getClaimDisplayValue,
  WellKnownClaim
} from '../../utils/itwClaimsUtils';

/**
 * Maps claims to the format required by the ClaimsSelector component.
 */
const mapClaims = (
  claims: Array<ClaimDisplayFormat>
): ComponentProps<typeof ClaimsSelector>['items'] =>
  claims.map(c => {
    const displayResult = getClaimDisplayValue(c);

    if (displayResult.type === 'image') {
      return {
        id: c.id,
        value: displayResult.value,
        description: c.label,
        type: 'image'
      };
    }

    if (
      (c.id.includes(WellKnownClaim.portrait) ||
        c.id.includes(WellKnownClaim.signature_usual_mark)) &&
      typeof displayResult.value === 'string'
    ) {
      return {
        id: c.id,
        value: `data:image/jpeg;base64,${addPadding(displayResult.value)}`,
        description: c.label,
        type: 'image'
      };
    }

    const textValue = Array.isArray(displayResult.value)
      ? displayResult.value.map(getSafeText).join(', ')
      : getSafeText(displayResult.value);

    return {
      id: c.id,
      value: textValue,
      description: c.label
    };
  });

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = Array<{
  credentialType: string;
  claimsToDisplay: Array<ClaimDisplayFormat>;
  isAuthenticated: boolean;
}>;

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
        label={t('wallet:presentation.trust.requiredClaims')}
        iconName="security"
        iconColor={theme['icon-decorative']}
      />
      <VStack space={24}>
        {data.map(({ claimsToDisplay, credentialType }) => (
          <ClaimsSelector
            key={credentialType}
            title={getCredentialNameFromType(credentialType)}
            items={mapClaims(claimsToDisplay)}
            defaultExpanded
            selectionEnabled={false}
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
