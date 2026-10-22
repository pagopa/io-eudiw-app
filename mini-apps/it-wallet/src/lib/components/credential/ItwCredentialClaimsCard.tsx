import {
  H6,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from '@pagopa/io-app-design-system';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useItWalletTheme } from '../../utils/theme';

const cardSpacing: IOSpacingScale = 16;

// Border width offset to ensure the header gradient fits within the border curves.
const CARD_BORDER = 1;

type ItwCredentialClaimsCardProps = PropsWithChildren<{
  /** The end color of the credential-specific header gradient. */
  gradientEndColor: string;
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
      <View accessibilityRole="header" style={styles.header}>
        <LinearGradient
          colors={[itwTheme['card-background'], gradientEndColor]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.title}>
          <H6>{title}</H6>
        </View>
      </View>
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
