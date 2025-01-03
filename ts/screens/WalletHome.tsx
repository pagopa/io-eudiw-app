import React from 'react';
import {View} from 'react-native';
import {
  IOStyles,
  HeaderFirstLevel,
  ButtonSolid
} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector} from '../store';
import {lifecycleIsOperationalSelector} from '../features/wallet/store/lifecycle';
import {ActivationBanner} from '../features/wallet/components/ActivationBanner';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const isWalletOperational = useAppSelector(lifecycleIsOperationalSelector);

  return (
    <>
      <HeaderFirstLevel
        title={t('global:tabNavigator.wallet')}
        type="singleAction"
        firstAction={{
          icon: 'coggle',
          onPress: () =>
            navigation.navigate('ROOT_TAB_NAV', {screen: 'MAIN_SETTINGS'}),
          accessibilityLabel: t('global:settings.title')
        }}
      />
      <View style={{...IOStyles.flex, ...IOStyles.horizontalContentPadding}}>
        {isWalletOperational ? (
          <View style={{...IOStyles.flex, justifyContent: 'flex-start'}}>
            <ActivationBanner
              title={t('wallet:activationBanner.title')}
              content={t('wallet:activationBanner.description')}
              action={t('wallet:activationBanner.action')}
            />
          </View>
        ) : (
          <ButtonSolid
            label={t('wallet:home.addCredential')}
            accessibilityLabel={t('wallet:home.addCredential')}
            onPress={() =>
              navigation.navigate('MAIN_WALLET', {
                screen: 'WALLET_CREDENTIAL_ISSUANCE_LIST'
              })
            }
            icon="addSmall"
            iconPosition="end"
            fullWidth={true}
          />
        )}
      </View>
    </>
  );
};

export default WalletHome;
