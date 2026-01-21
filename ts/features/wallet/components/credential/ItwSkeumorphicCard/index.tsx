import { IOColors, Tag, useScaleAnimation } from '@pagopa/io-app-design-system';
import { ReactNode, useMemo, useState } from 'react';

import { Canvas } from '@shopify/react-native-skia';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from '../../../utils/itwCredentialUtils';
import {
  ItwBrandedSkiaBorder,
  ItwIridescentBorderVariant
} from '../../ItwBrandedSkiaBorder';
import {
  ItwCredentialStatus,
  StoredCredential
} from '../../../utils/itwTypesUtils';
import { ParsedClaimsRecord } from '../../../utils/claims';
import { CardBackground } from './CardBackground';
import { CardData } from './CardData';
import { FlippableCard } from './FlippableCard';

export type ItwSkeumorphicCardProps = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
  valuesHidden: boolean;
  isFlipped?: boolean;
  onPress?: () => void;
  claims: ParsedClaimsRecord;
};

export const ItwSkeumorphicCard = ({
  credential,
  status,
  isFlipped = false,
  onPress,
  valuesHidden,
  claims
}: ItwSkeumorphicCardProps) => {
  const FrontSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="front"
        />
        <CardData
          claims={claims}
          credential={credential}
          side="front"
          valuesHidden={valuesHidden}
        />
      </CardSideBase>
    ),
    [credential, status, valuesHidden, claims]
  );

  const BackSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="back"
        />
        <CardData
          claims={claims}
          credential={credential}
          side="back"
          valuesHidden={valuesHidden}
        />
      </CardSideBase>
    ),
    [credential, status, valuesHidden, claims]
  );

  const card = (
    <FlippableCard
      containerStyle={[styles.card]}
      FrontComponent={FrontSide}
      BackComponent={BackSide}
      isFlipped={isFlipped}
    />
  );

  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        // {...accessibilityProps}
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={scaleAnimatedStyle}>{card}</Animated.View>
      </Pressable>
    );
  }

  return (
    // {...accessibilityProps}
    <View accessibilityRole="image">{card}</View>
  );
};

/**
 * Maps credential status to the corresponding gradient variant.
 */
const gradientVariantByStatus: Record<
  ItwCredentialStatus,
  ItwIridescentBorderVariant
> = {
  valid: 'default',
  expiring: 'warning',
  expired: 'error',
  jwtExpiring: 'warning',
  jwtExpired: 'error',
  invalid: 'error',
  unknown: 'error'
};

type CardSideBaseProps = {
  status: ItwCredentialStatus;
  children: ReactNode;
};

const CardSideBase = ({ status, children }: CardSideBaseProps) => {
  const borderColorMap = useBorderColorByStatus();

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const statusTagProps = tagPropsByStatus[status];
  const borderColor = borderColorMap[status];
  // Include "jwtExpired" as a valid status because the credential skeumorphic card with this state
  // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
  const isValid = [...validCredentialStatuses, 'jwtExpired'].includes(status);

  const dynamicStyle: StyleProp<ViewStyle> = {
    borderColor,
    backgroundColor: isValid ? undefined : 'rgba(255,255,255,0.7)'
  };

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View onLayout={handleOnLayout} style={styles.container}>
      {/* Status badge  */}
      {statusTagProps && (
        <View style={styles.tag}>
          <Tag {...statusTagProps} />
        </View>
      )}

      {/* Card background and claims */}
      {children}

      {/* Displays a faded overlay if required by the credential status */}
      <View style={[styles.faded, dynamicStyle]} />

      {/* Skia Canvas for border and light effect, only displayed if IT-Wallet enabled */}
      <Canvas
        style={{
          position: 'absolute',
          width: size.width,
          height: size.height
        }}
        testID="itWalletBrandBorderTestID"
      >
        {/* Animated gradient border */}
        <ItwBrandedSkiaBorder
          width={size.width}
          height={size.height}
          variant={gradientVariantByStatus[status]}
          thickness={4}
          cornerRadius={8}
        />
      </Canvas>
    </View>
  );
};

// Magic number for the aspect ratio of the card
// extracted from the design
export const SKEUMORPHIC_CARD_ASPECT_RATIO = 16 / 10.09;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden'
  },
  card: {
    aspectRatio: SKEUMORPHIC_CARD_ASPECT_RATIO,
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 4 // To avoid the shadow to be clipped by the header
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android
    elevation: 8
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20
  },
  faded: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderRadius: 8
  }
});
