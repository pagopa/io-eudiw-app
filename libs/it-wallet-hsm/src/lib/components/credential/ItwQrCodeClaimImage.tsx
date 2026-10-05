import { Appearance, StyleSheet, View } from 'react-native';

import { ParsedClaimsRecord } from '../../utils/claims';
import { QrCodeImage } from '../QrCodeImage';

type ItwQrCodeClaimImageProps = {
  claim: ParsedClaimsRecord[string];
};

/**
 * This component allows to render the content of a claim in form of a QR Code
 */
export const ItwQrCodeClaimImage = ({ claim }: ItwQrCodeClaimImageProps) => {
  if (
    claim.parsed === undefined ||
    claim.parsed.value === undefined ||
    typeof claim.parsed.value !== 'string'
  ) {
    return null;
  }
  const colorScheme = Appearance.getColorScheme();

  return (
    <View style={styles.qrCode}>
      <QrCodeImage
        inverted={colorScheme === 'dark'}
        size={230}
        value={claim.parsed.value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  qrCode: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12
  }
});
