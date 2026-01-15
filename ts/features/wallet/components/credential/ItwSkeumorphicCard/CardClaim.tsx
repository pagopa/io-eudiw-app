import { WithTestID } from '@pagopa/io-app-design-system';

import { memo, ReactElement, ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import z from 'zod';
import { Either, Prettify } from '../../../../../types/utils';
import { ClaimDisplayFormat } from '../../../utils/types';
import { SimpleDateFormat } from '../../../utils/itwClaimsUtils';
import { claimScheme } from '../../../utils/claims';
import { format } from '../../../utils/dates';
import { ClaimImage } from './ClaimImage';
import { ClaimLabel, ClaimLabelProps } from './ClaimLabel';

export type PercentPosition = `${number}%`;

// Defines the claim horizontal position using the left OR the right absolute position value
type HorizontalClaimPosition = Either<
  { left: PercentPosition },
  { right: PercentPosition }
>;

// Defines the claim vertical position using the top OR the bottom absolute position value
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
    // A claim that will be used to render its component
    // Since we are passing this value by accessing the claims object by key, the value could be undefined
    claim?: ClaimDisplayFormat;
    // Absolute position expressed in percentages from top-left corner
    position?: ClaimPosition;
    // Claim dimensions
    dimensions?: ClaimDimensions;
    // Optional format for dates contained in the claim component
    dateFormat?: SimpleDateFormat;
  } & ClaimLabelProps
>;

/**
 * Default claim component, it decoded the provided value and renders the corresponding component
 * @returns The corresponding component if a value is correctly decoded, otherwise null
 */
const CardClaim = ({
  claim,
  position,
  dimensions,
  testID,
  dateFormat = 'DD/MM/YY',
  ...labelProps
}: WithTestID<CardClaimProps>) => {
  const claimContent = useMemo(() => {
    const parsing = claimScheme.safeParse(claim);

    if (parsing.success) {
      const parsed = parsing.data;
      switch (parsed.type) {
        case 'string':
          return <ClaimLabel {...labelProps}>{parsed.value}</ClaimLabel>;
        case 'date':
        case 'expireDate':
          const formattedDate = format(parsed.value, dateFormat);
          return <ClaimLabel {...labelProps}>{formattedDate}</ClaimLabel>;
        case 'image':
          return (
            <ClaimImage
              base64={parsed.value}
              blur={labelProps.hidden ? 7 : 0}
            />
          );
        case 'drivingPrivileges':
          const privileges = parsed.value
            .map(p => p.vehicle_category_code)
            .join(' ');
          return <ClaimLabel {...labelProps}>{privileges}</ClaimLabel>;
        case 'placeOfBirth':
          return (
            <ClaimLabel {...labelProps}>{parsed.value.locality}</ClaimLabel>
          );
        default:
          return (
            <ClaimLabel {...labelProps}>
              {JSON.stringify(parsed.value)}
            </ClaimLabel>
          );
      }
    }

    return null;
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

export type CardClaimRendererProps<T> = {
  // A claim that will be used to render a component
  // Since we are passing this value by accessing the claims object by key, the value could be undefined
  claim?: ClaimDisplayFormat;
  // Function that check that the proviced claim is of the correct type
  parser: z.ZodType<T, z.ZodTypeDef, any>;
  // Function that renders a component with the decoded provided claim
  component: (decoded: T) => ReactElement | Iterable<ReactElement>;
};

/**
 * Allows to render a claim if it satisfies the provided `is` function
 * @returns The component from the props if value if correctly decoded, otherwise it returns null
 */
const CardClaimRenderer = <T,>({
  claim,
  parser,
  component
}: CardClaimRendererProps<T>) => {
  const parsing = parser.safeParse(claim);
  if (parsing.success) {
    return component(parsing.data);
  }

  return null;
};

// O.filter(is), O.fold(constNull, component)

export type CardClaimContainerProps = WithTestID<{
  position?: ClaimPosition;
  dimensions?: ClaimDimensions;
  children?: ReactNode;
}>;

/**
 * Component that allows to position a claim using "left" and "top" absolute values
 */
const CardClaimContainer = ({
  position,
  dimensions,
  children,
  testID
}: CardClaimContainerProps) => (
  <View testID={testID} style={[styles.container, position, dimensions]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute'
  }
});

const MemoizedCardClaim = memo(CardClaim) as typeof CardClaim;

const MemoizedCardClaimRenderer = memo(
  CardClaimRenderer
) as typeof CardClaimRenderer;

export {
  MemoizedCardClaim as CardClaim,
  CardClaimContainer,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
