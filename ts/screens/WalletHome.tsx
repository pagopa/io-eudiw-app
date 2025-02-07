import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  IOStyles,
  HeaderFirstLevel,
  IOColors,
  makeFontStyleObject
} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector} from '../store';
import {lifecycleIsOperationalSelector} from '../features/wallet/store/lifecycle';
import {ActivationBanner} from '../features/wallet/components/ActivationBanner';
import {credentialsSelector} from '../features/wallet/store/credentials';
import {getCredentialNameByType} from '../features/wallet/utils/credentials';
import {CredentialCard} from '../features/wallet/components/CredentialCard';
import {IOScrollView} from '../components/IOScrollView';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const isWalletOperational = useAppSelector(lifecycleIsOperationalSelector);
  const credentials = useAppSelector(credentialsSelector);

  return (
    <>
      <HeaderFirstLevel
        title={t('global:tabNavigator.wallet')}
        type="singleAction"
        firstAction={{
          icon: 'coggle',
          onPress: () =>
            navigation.navigate('ROOT_MAIN_NAV', {screen: 'MAIN_SETTINGS'}),
          accessibilityLabel: t('global:settings.title')
        }}
      />
      {isWalletOperational ? (
        <View style={{...IOStyles.flex, ...IOStyles.horizontalContentPadding}}>
          <View style={{...IOStyles.flex, justifyContent: 'flex-start'}}>
            <ActivationBanner
              title={t('wallet:activationBanner.title')}
              content={t('wallet:activationBanner.description')}
              action={t('wallet:activationBanner.action')}
            />
          </View>
        </View>
      ) : (
        <IOScrollView
          actions={{
            type: 'SingleButton',
            primary: {
              label: t('wallet:addcredential.homebuttonlabel'),
              icon: 'add',
              onPress: () => {
                navigation.navigate('MAIN_WALLET_NAV', {
                  screen: 'CREDENTIAL_ISSUANCE_SELECT'
                });
              },
              iconPosition: 'end'
            }
          }}>
          <FlatList
            scrollEnabled={false}
            data={credentials.credentials}
            renderItem={({item, index}) => {
              if (index !== credentials.credentials.length - 1) {
                return (
                  <View style={styles.previewContainer}>
                    <View style={styles.cardContainer}>
                      <View style={styles.card}>
                        <View style={styles.border} />
                        <View style={styles.header}>
                          <Text style={styles.label}>
                            {`${getCredentialNameByType(item.credentialType)}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              } else {
                return (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('MAIN_WALLET_NAV', {
                        screen: 'PRESENTATION_CREDENTIAL_DETAILS',
                        params: {credentialType: item.credentialType}
                      })
                    }>
                    <CredentialCard credentialType={item.credentialType} />
                  </Pressable>
                );
              }
            }}
          />
        </IOScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    aspectRatio: 9 / 2,
    overflow: 'hidden'
  },
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: 'hidden'
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors['grey-100']
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: IOColors['grey-50']
  },
  label: {
    flex: 1,
    ...makeFontStyleObject(16, 'TitilliumSansPro', 20, 'Bold')
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14
  }
});

export default WalletHome;
