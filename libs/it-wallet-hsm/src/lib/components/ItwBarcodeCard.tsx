import { H4, IOColors, VSpacer } from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import {
  BarcodeCreatorView,
  BarcodeFormat
} from 'react-native-barcode-creator';

type ItwBarcodeCardProps = {
  value: string;
};

export const ItwBarcodeCard = ({ value }: ItwBarcodeCardProps) => (
  <View style={styles.container}>
    <VSpacer size={4} />
    <BarcodeCreatorView
      background={IOColors.white}
      foregroundColor={IOColors.black}
      format={BarcodeFormat.CODE128}
      style={styles.barcode}
      value={value}
    />
    <VSpacer size={4} />
    <H4 textStyle={StyleSheet.flatten([styles.label])}>{value}</H4>
  </View>
);

const styles = StyleSheet.create({
  barcode: {
    height: 70,
    width: '100%'
  },
  container: {
    borderColor: IOColors['grey-100'],
    borderRadius: 8,
    borderWidth: 1,
    padding: 15
  },
  label: {
    alignSelf: 'center',
    textAlign: 'center'
  }
});
