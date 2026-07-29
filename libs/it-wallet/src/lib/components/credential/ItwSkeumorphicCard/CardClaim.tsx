import { WithTestID } from '@pagopa/io-app-design-system';
import { format } from 'date-fns';
import { memo, ReactElement, ReactNode, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';

import {
  ClaimScheme,
  claimType,
  ParsedClaimsRecord
} from '../../../utils/claims';
import { SimpleDateFormat } from '../../../utils/itwClaimsUtils';
import {
  Either,
  PercentPosition,
  Prettify
} from '../../../utils/itwTypesUtils';
import { ClaimImage } from './ClaimImage';
import { ClaimLabel, ClaimLabelProps } from './ClaimLabel';

export type ClaimPosition = HorizontalClaimPosition & VerticalClaimPosition;

type CardClaimProps = Prettify<
  ClaimLabelProps & {
    // A claim that will be used to render its component
    // Since we are passing this value by accessing the claims object by key, the value could be undefined
    claim?: ParsedClaimsRecord[string];
    // Optional format for dates contained in the claim component
    dateFormat?: SimpleDateFormat;
    // Claim dimensions
    dimensions?: ClaimDimensions;
    // Absolute position expressed in percentages from top-left corner
    position?: ClaimPosition;
  }
>;

type ClaimDimensions = Prettify<
  Partial<Record<'height' | 'width', PercentPosition>> &
    Pick<ViewStyle, 'aspectRatio'>
>;

type HorizontalClaimPosition = Either<
  { left: PercentPosition },
  { right: PercentPosition }
>;

// Defines the claim vertical position using the top OR the bottom absolute position value
type VerticalClaimPosition = Either<
  { top: PercentPosition },
  { bottom: PercentPosition }
>;

/**
 * Default claim component, it decoded the provided value and renders the corresponding component
 * @returns The corresponding component if a value is correctly decoded, otherwise null
 */
const CardClaim = ({
  claim,
  dateFormat = 'DD/MM/YY',
  dimensions,
  position,
  testID,
  ...labelProps
}: WithTestID<CardClaimProps>) => {
  const claimContent = useMemo(() => {
    if (!claim) {
      return null;
    }

    if (claim.parsed !== undefined) {
      switch (claim.parsed.type) {
        case claimType.date:
        case claimType.expireDate: {
          const formattedDate = format(claim.parsed.value, dateFormat);
          return <ClaimLabel {...labelProps}>{formattedDate}</ClaimLabel>;
        }

        case claimType.drivingPrivileges: {
          const privileges = claim.parsed.value
            .map(p => p.vehicle_category_code)
            .join(' ');
          return <ClaimLabel {...labelProps}>{privileges}</ClaimLabel>;
        }

        case claimType.image:
          return (
            <ClaimImage
              base64={claim.parsed.value}
              blur={labelProps.hidden ? 7 : 0}
            />
          );

        case claimType.verificationEvidence:
          return (
            <ClaimLabel {...labelProps}>
              {claim.parsed.value.organization_name}
            </ClaimLabel>
          );

        case claimType.string:
        case claimType.stringArray:
        default:
          return (
            <ClaimLabel {...labelProps}>
              {Array.isArray(claim.parsed.value)
                ? claim.parsed.value.join(', ')
                : String(claim.parsed.value)}
            </ClaimLabel>
          );
      }
    } else {
      return null;
    }
  }, [claim, labelProps, dateFormat]);

  if (!claimContent) {
    return null;
  }

  return (
    <CardClaimContainer
      dimensions={dimensions}
      position={position}
      testID={testID}
    >
      {claimContent}
    </CardClaimContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute'
  }
});

type CardClaimRendererProps<T extends ClaimScheme['type']> = {
  claim?: ClaimScheme;
  component: (claim: ClaimOfType<T>) => Iterable<ReactElement> | ReactElement;
  type: T;
};

type ClaimOfType<T extends ClaimScheme['type']> = Extract<
  ClaimScheme,
  { type: T }
>;

const CardClaimRenderer = <T extends keyof typeof claimType>({
  claim,
  component,
  type
}: CardClaimRendererProps<T>) => {
  if (!claim || claim.type !== type) {
    return null;
  }

  return component(claim as ClaimOfType<T>);
};

type CardClaimContainerProps = WithTestID<{
  children?: ReactNode;
  dimensions?: ClaimDimensions;
  onLayout?: (event: LayoutChangeEvent) => void;
  position?: ClaimPosition;
}>;

const CardClaimContainer = ({
  children,
  dimensions,
  onLayout,
  position,
  testID
}: CardClaimContainerProps) => (
  <View
    onLayout={onLayout}
    style={[styles.container, position, dimensions]}
    testID={testID}
  >
    {children}
  </View>
);

const MemoizedCardClaim = memo(CardClaim) as typeof CardClaim;

const MemoizedCardClaimRenderer = memo(
  CardClaimRenderer
) as typeof CardClaimRenderer;

export {
  MemoizedCardClaim as CardClaim,
  CardClaimContainer,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
