import { WithTestID } from '@pagopa/io-app-design-system';
import { memo, ReactElement, ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ParsedCredential } from '../../../utils/types';
import {
  ClaimValue,
  DrivingPrivilegesClaim,
  DrivingPrivilegesCustomClaim,
  ImageClaim,
  NestedClaim,
  PlaceOfBirthClaim,
  SimpleDateClaim,
  SimpleDateFormat
} from '../../../utils/eudiwClaimsUtils';

import {
  Either,
  PercentPosition,
  Prettify
} from '../../../utils/eudiwTypesUtils';
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
    claim?: ParsedCredential[number];
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
    const decodedResult = ClaimValue.decode(claim?.value);

    // eslint-disable-next-line no-underscore-dangle
    if (!decodedResult || decodedResult._tag === 'Left') {
      return null;
    }

    const decoded = decodedResult.value;

    if (NestedClaim.is(decoded)) {
      return null;
    }
    if (SimpleDateClaim.is(decoded)) {
      const formattedDate = decoded.toString(dateFormat);
      return <ClaimLabel {...labelProps}>{formattedDate}</ClaimLabel>;
    } else if (ImageClaim.is(decoded)) {
      return <ClaimImage base64={decoded} blur={labelProps.hidden ? 7 : 0} />;
    } else if (
      DrivingPrivilegesClaim.is(decoded) ||
      DrivingPrivilegesCustomClaim.is(decoded)
    ) {
      const privileges = decoded.map(p => p.driving_privilege).join(' ');
      return <ClaimLabel {...labelProps}>{privileges}</ClaimLabel>;
    } else if (PlaceOfBirthClaim.is(decoded)) {
      return <ClaimLabel {...labelProps}>{decoded.locality}</ClaimLabel>;
    } else {
      return <ClaimLabel {...labelProps}>{String(decoded)}</ClaimLabel>;
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

export type CardClaimRendererProps<T> = {
  claim?: ParsedCredential[number];
  is: (value: unknown) => value is T;
  component: (decoded: T) => ReactElement | Iterable<ReactElement>;
};

const CardClaimRenderer = <T,>({
  claim,
  is,
  component
}: CardClaimRendererProps<T>) => {
  const decodedResult = ClaimValue.decode(claim?.value);

  // eslint-disable-next-line no-underscore-dangle
  if (decodedResult && decodedResult._tag === 'Right') {
    const value = decodedResult.value;
    if (is(value)) {
      return component(value);
    }
  }

  return null;
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
