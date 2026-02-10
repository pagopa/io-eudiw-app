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
        value={claim.parsed.value}
        size={230}
        inverted={colorScheme === 'dark'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  qrCode: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24
  }
});
