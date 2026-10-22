import { BodySmall } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { StyleSheet, View } from 'react-native';

import ITWalletLogoImage from '../../assets/img/brand/itw_logo.svg';

export const PoweredByItWalletText = () => (
  <View style={styles.poweredBy} testID="poweredByItWalletTextTestID">
    <BodySmall>
      {t('presentation.credentialDetails.partOf', { ns: 'wallet' })}
    </BodySmall>
    <ITWalletLogoImage accessibilityLabel="IT Wallet" height={16} width={80} />
  </View>
);

const styles = StyleSheet.create({
  poweredBy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center'
  }
});
