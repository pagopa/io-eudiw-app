import { WithTestID } from '@pagopa/io-app-design-system';
import { JSX, memo, ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { format } from 'date-fns';

import {
  Either,
  PercentPosition,
  Prettify
} from '../../../utils/itwTypesUtils';
import {
  ClaimScheme,
  claimType,
  SimpleDateFormat
} from '../../../utils/claims';
import { ClaimLabel, ClaimLabelProps } from './ClaimLabel';
import { ClaimImage } from './ClaimImage';

type HorizontalClaimPosition = Either<
  { left: PercentPosition },
  { right: PercentPosition }
>;

type VerticalClaimPosition = Either<
  { top: PercentPosition },
  { bottom: PercentPosition }
>;

export type ClaimPosition = HorizontalClaimPosition & VerticalClaimPosition;

export type ClaimDimensions = Prettify<
  Partial<Record<'width' | 'height', PercentPosition>> &
    Pick<ViewStyle, 'aspectRatio'>
>;

export type CardClaimProps = Prettify<
  {
    claim?: ClaimScheme;
    position?: ClaimPosition;
    dimensions?: ClaimDimensions;
    dateFormat?: SimpleDateFormat;
  } & ClaimLabelProps
>;
const CardClaim = ({
  claim,
  position,
  dimensions,
  testID,
  dateFormat = 'DD/MM/YY',
  ...labelProps
}: WithTestID<CardClaimProps>) => {
  const claimContent = useMemo(() => {
    if (!claim) {
      return null;
    }

    switch (claim.type) {
      case claimType.date:
      case claimType.expireDate: {
        const formattedDate = format(
          claim.value,
          dateFormat === 'DD/MM/YY' ? 'dd/MM/yy' : 'dd/MM/yyyy'
        );
        return <ClaimLabel {...labelProps}>{formattedDate}</ClaimLabel>;
      }

      case claimType.image:
        return (
          <ClaimImage base64={claim.value} blur={labelProps.hidden ? 7 : 0} />
        );

      case claimType.drivingPrivileges: {
        const privileges = claim.value
          .map(p => p.vehicle_category_code)
          .join(' ');
        return <ClaimLabel {...labelProps}>{privileges}</ClaimLabel>;
      }

      case claimType.verificationEvidence:
        return (
          <ClaimLabel {...labelProps}>
            {claim.value.organization_name}
          </ClaimLabel>
        );

      case claimType.string:
      case claimType.stringArray:
      default:
        return (
          <ClaimLabel {...labelProps}>
            {Array.isArray(claim.value)
              ? claim.value.join(', ')
              : String(claim.value)}
          </ClaimLabel>
        );
    }
  }, [claim, labelProps, dateFormat]);

  if (!claimContent) {
    return null;
  }

  return (
    <CardClaimContainer
      testID={testID}
      position={position}
      dimensions={dimensions}
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

type CardClaimRendererProps<T extends ClaimScheme> = {
  claim?: T;
  type: T['type'];
  component: (claim: T) => JSX.Element;
};

const CardClaimRenderer = <T extends ClaimScheme>({
  claim,
  type,
  component
}: CardClaimRendererProps<T>) => {
  if (!claim || claim.type !== type) {
    return null;
  }

  return component(claim);
};

export type CardClaimContainerProps = WithTestID<{
  position?: ClaimPosition;
  dimensions?: ClaimDimensions;
  children?: ReactNode;
  style?: ViewStyle;
}>;

const CardClaimContainer = ({
  position,
  dimensions,
  children,
  testID,
  style
}: CardClaimContainerProps) => (
  <View testID={testID} style={[styles.container, position, dimensions, style]}>
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
