import { H4, IOColors, VSpacer } from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import Barcode from 'react-native-barcode-builder';

type ItwBarcodeCardProps = {
  value: string;
};

export const ItwBarcodeCard = ({ value }: ItwBarcodeCardProps) => (
  <View style={styles.container}>
    <VSpacer size={4} />
    <Barcode format="CODE128" value={value} height={70} width={1.15} />
    <VSpacer size={4} />
    <H4 textStyle={StyleSheet.flatten([styles.label])}>{value}</H4>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderColor: IOColors['grey-100'],
    borderWidth: 1,
    padding: 5,
    borderRadius: 8
  },
  label: {
    alignSelf: 'center',
    textAlign: 'center'
  }
});
