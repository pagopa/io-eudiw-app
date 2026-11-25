import { BodySmall } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { StyleSheet, View } from 'react-native';

import CertifiedEudiWalletLogo from '../../assets/img/brand/certified_eudi_wallet.svg';
import ITWalletLogoImage from '../../assets/img/brand/itw_logo.svg';

type Props = {
  /**
   * Whether to also show the Certified EUDI Wallet logo next to the IT-Wallet one
   */
  showCertifiedEudiWallet?: boolean;
};

export const PoweredByItWalletText = ({ showCertifiedEudiWallet }: Props) => (
  <View style={styles.poweredBy} testID="poweredByItWalletTextTestID">
    <BodySmall>
      {t('presentation.credentialDetails.partOf', { ns: 'hsm' })}
    </BodySmall>
    <ITWalletLogoImage accessibilityLabel="IT Wallet" height={16} width={80} />
    {showCertifiedEudiWallet && (
      <CertifiedEudiWalletLogo
        accessibilityLabel="Certified EUDI Wallet"
        height={24}
        style={styles.certifiedLogo}
        width={93}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  certifiedLogo: {
    marginLeft: 8
  },
  poweredBy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center'
  }
});
