import { BodySmall } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { StyleSheet, View } from 'react-native';
import ITWalletLogoImage from '../assets/img/brand/itw_logo.svg';

export const PoweredByItWalletText = () => (
  <View style={styles.poweredBy} testID="poweredByItWalletTextTestID">
    <BodySmall>
      {I18n.t('presentation.credentialDetails.partOf', { ns: 'wallet' })}
    </BodySmall>
    <ITWalletLogoImage width={80} height={16} accessibilityLabel="IT Wallet" />
  </View>
);

const styles = StyleSheet.create({
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  }
});
