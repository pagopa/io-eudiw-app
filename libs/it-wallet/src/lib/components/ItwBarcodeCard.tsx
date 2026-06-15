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
      value={value}
      format={BarcodeFormat.CODE128}
      background={IOColors.white}
      foregroundColor={IOColors.black}
      style={styles.barcode}
    />
    <VSpacer size={4} />
    <H4 textStyle={StyleSheet.flatten([styles.label])}>{value}</H4>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderColor: IOColors['grey-100'],
    borderWidth: 1,
    padding: 15,
    borderRadius: 8
  },
  barcode: {
    width: '100%',
    height: 70
  },
  label: {
    alignSelf: 'center',
    textAlign: 'center'
  }
});
