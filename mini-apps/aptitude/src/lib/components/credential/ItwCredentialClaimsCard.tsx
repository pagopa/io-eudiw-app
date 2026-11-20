import {
  H6,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from '@pagopa/io-app-design-system';
import { PropsWithChildren, ReactNode } from 'react';
import {
  AccessibilityState,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

import { useItWalletTheme } from '../../utils/theme';

const cardSpacing: IOSpacingScale = 16;

// Border width offset to ensure the header gradient fits within the border curves.
const CARD_BORDER = 1;

type ItwCredentialClaimsCardProps = PropsWithChildren<{
  /** The end color of the credential-specific header gradient. */
  gradientEndColor: string;
  /** Accessibility label of the pressable header. */
  headerAccessibilityLabel?: string;
  /** Accessibility state of the pressable header. */
  headerAccessibilityState?: AccessibilityState;
  /** Element rendered at the end of the header. */
  headerAccessory?: ReactNode;
  /** Extra (animated) style applied to the header. */
  headerStyle?: AnimatedStyle<StyleProp<ViewStyle>>;
  /** When set, the header becomes pressable. */
  onHeaderPress?: () => void;
  /** The title displayed in the card header. */
  title: string;
}>;

/**
 * Renders the common visual structure for credential claims: a bordered card
 * with a credential-themed gradient header and arbitrary body content.
 */
export const ItwCredentialClaimsCard = ({
  children,
  gradientEndColor,
  headerAccessibilityLabel,
  headerAccessibilityState,
  headerAccessory,
  headerStyle,
  onHeaderPress,
  title
}: ItwCredentialClaimsCardProps) => {
  const { theme } = useIOThemeContext();
  const itwTheme = useItWalletTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: IOColors[theme['appBackground-primary']],
          borderColor: IOColors[theme['cardBorder-default']]
        }
      ]}
    >
      <Pressable
        accessibilityLabel={headerAccessibilityLabel}
        accessibilityRole={onHeaderPress ? 'button' : 'header'}
        accessibilityState={headerAccessibilityState}
        disabled={!onHeaderPress}
        onPress={onHeaderPress}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <LinearGradient
            colors={[itwTheme['card-background'], gradientEndColor]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.title}>
            <H6>{title}</H6>
          </View>
          {headerAccessory}
        </Animated.View>
      </Pressable>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderCurve: 'continuous',
    borderRadius: IOAccordionRadius,
    borderWidth: 1
  },
  header: {
    alignItems: 'center',
    borderTopLeftRadius: IOAccordionRadius - CARD_BORDER,
    borderTopRightRadius: IOAccordionRadius - CARD_BORDER,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: cardSpacing
  },
  title: {
    flexGrow: 1,
    flexShrink: 1
  }
});
