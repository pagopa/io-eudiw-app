import React from 'react';
import {View} from 'react-native';
import {IOStyles, HeaderFirstLevel} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from '../store';
import {lifecycleIsOperationalSelector} from '../features/wallet/store/lifecycle';
import {ActivationBanner} from '../features/wallet/components/ActivationBanner';

/**
 * IT-Wallet home screen which contains a top bar with categories, an activation banner and a list of wallet items based on the selected category.
 * It also a label to reset the wallet credentials and a button to add a new credential which only works if the experimental feature flag is true.
 */
const WalletHome = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const isWalletOperational = useAppSelector(lifecycleIsOperationalSelector);

  return (
    <>
      <HeaderFirstLevel
        title={t('global:tabNavigator.wallet')}
        type="singleAction"
        firstAction={{
          icon: 'coggle',
          onPress: () => void 0,
          accessibilityLabel: ''
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
          <></>
        )}
      </View>
    </>
  );
};

export default WalletHome;
