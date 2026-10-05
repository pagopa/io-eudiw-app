import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CredentialCardConfig } from './config';

type Props = Pick<CredentialCardConfig, 'background'>;

/**
 * Renders a plain, generic background for the credential card: a single
 * solid color, with no credential-specific gradient, pattern or overlay.
 */
export const CardBackground = memo(({ background }: Props) => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: background }]} />
));
