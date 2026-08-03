import { IOColors, Tag } from '@pagopa/io-app-design-system';
import { Canvas } from '@shopify/react-native-skia';
import { t } from 'i18next';
import { ReactNode, useMemo, useState } from 'react';
import {
  AccessibilityProps,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';

import { ParsedClaimsRecord } from '../../../utils/claims';
import { accessibilityLabelByStatus } from '../../../utils/itwAccessibilityUtils';
import { ItwCredentialCapabilities } from '../../../utils/itwCredentialCapabilities';
import {
  getCredentialNameFromType,
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from '../../../utils/itwCredentialUtils';
import {
  ItwCredentialStatus,
  StoredCredentialMetadata
} from '../../../utils/itwTypesUtils';
import {
  ItwBrandedSkiaBorder,
  ItwIridescentBorderVariant
} from '../../ItwBrandedSkiaBorder';
import { CardBackground } from './CardBackground';
import { CardData } from './CardData';
import { CardWidthContext } from './CardWidthContext';
import { FlippableCard } from './FlippableCard';

type ItwSkeumorphicCardProps = {
  capabilities: ItwCredentialCapabilities;
  claims: ParsedClaimsRecord;
  credential: StoredCredentialMetadata;
  isFlipped?: boolean;
  status: ItwCredentialStatus;
  valuesHidden: boolean;
};

export const ItwSkeumorphicCard = ({
  capabilities,
  claims,
  credential,
  isFlipped = false,
  status,
  valuesHidden
}: ItwSkeumorphicCardProps) => {
  const FrontSide = useMemo(
    () => (
      <CardSideBase
        capabilities={capabilities}
        credentialType={credential.credentialType}
        status={status}
      >
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
    [credential, status, valuesHidden, capabilities, claims]
  );

  const BackSide = useMemo(
    () => (
      <CardSideBase
        capabilities={capabilities}
        credentialType={credential.credentialType}
        status={status}
      >
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
    [credential, status, valuesHidden, capabilities, claims]
  );

  const accessibilityProps = useMemo(
    () =>
      ({
        accessibilityLabel: `${getCredentialNameFromType(
          credential.credentialType
        )}, ${t(
          isFlipped
            ? 'presentation.credentialDetails.card.back'
            : 'presentation.credentialDetails.card.front',
          {
            ns: 'wallet'
          }
        )}`,
        accessibilityValue: { text: accessibilityLabelByStatus[status] },
        accessible: true
      }) as AccessibilityProps,
    [credential.credentialType, isFlipped, status]
  );

  const card = (
    <FlippableCard
      BackComponent={BackSide}
      containerStyle={[styles.card]}
      FrontComponent={FrontSide}
      isFlipped={isFlipped}
    />
  );

  return (
    <View {...accessibilityProps} accessibilityRole="image">
      {card}
    </View>
  );
};

/**
 * Maps credential status to the corresponding gradient variant.
 */
const gradientVariantByStatus: Record<
  ItwCredentialStatus,
  ItwIridescentBorderVariant
> = {
  expired: 'error',
  expiring: 'warning',
  invalid: 'error',
  jwtExpired: 'error',
  jwtExpiring: 'warning',
  unknown: 'error',
  valid: 'default'
};

type CardSideBaseProps = {
  capabilities: ItwCredentialCapabilities;
  children: ReactNode;
  credentialType: string;
  status: ItwCredentialStatus;
};

const CardSideBase = ({
  capabilities,
  children,
  credentialType,
  status
}: CardSideBaseProps) => {
  const borderColorMap = useBorderColorByStatus(credentialType);

  const [size, setSize] = useState<{ height: number; width: number }>({
    height: 0,
    width: 0
  });

  const { showStatusTag } = capabilities;
  const statusTagProps = showStatusTag ? tagPropsByStatus[status] : undefined;
  const borderColor = borderColorMap[status];
  // Include "jwtExpired" as a valid status because the credential skeumorphic card with this state
  // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
  const isValid = [...validCredentialStatuses, 'jwtExpired'].includes(status);

  const dynamicStyle: StyleProp<ViewStyle> = {
    backgroundColor: isValid ? undefined : 'rgba(255,255,255,0.7)',
    borderColor
  };

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSize({ height, width });
  };

  return (
    <View onLayout={handleOnLayout} style={styles.container}>
      <CardWidthContext.Provider value={size.width}>
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
            height: size.height,
            position: 'absolute',
            width: size.width
          }}
          testID="itWalletBrandBorderTestID"
        >
          {/* Animated gradient border */}
          <ItwBrandedSkiaBorder
            cornerRadius={8}
            height={size.height}
            thickness={4}
            variant={gradientVariantByStatus[status]}
            width={size.width}
          />
        </Canvas>
      </CardWidthContext.Provider>
    </View>
  );
};

// Magic number for the aspect ratio of the card
// extracted from the design
export const SKEUMORPHIC_CARD_ASPECT_RATIO = 16 / 10.09;

const styles = StyleSheet.create({
  card: {
    aspectRatio: SKEUMORPHIC_CARD_ASPECT_RATIO,
    // Android
    elevation: 8,
    shadowColor: IOColors.black,
    shadowOffset: {
      height: 4, // To avoid the shadow to be clipped by the header
      width: 0
    },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  container: {
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden'
  },
  faded: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
    borderWidth: 4
  },
  tag: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 20
  }
});
