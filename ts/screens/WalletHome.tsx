import { FlatList, Pressable, View } from 'react-native';
import {
  HeaderFirstLevel,
  VSpacer,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store';
import { lifecycleIsOperationalSelector } from '../features/wallet/store/lifecycle';
import { ActivationBanner } from '../features/wallet/components/ActivationBanner';
import { credentialsSelector } from '../features/wallet/store/credentials';
import { CredentialCard } from '../features/wallet/components/credential/CredentialCard';
import { IOScrollView } from '../components/IOScrollView';

/**
 * Wallet home to be rendered as the first page in the tab navigator.
 * It shows a banner when the wallet is in OPERATIONL status, otherwise it shows the lists of the credentials
 * available in the wallet.
 */
const WalletHome = () => {
  const { t } = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const isWalletOperational = useAppSelector(lifecycleIsOperationalSelector);
  const credentials = useAppSelector(credentialsSelector);

  return (
    <>
      <HeaderFirstLevel
        title={t('global:tabNavigator.wallet')}
        actions={[
          {
            icon: 'coggle',
            onPress: () =>
              navigation.navigate('ROOT_MAIN_NAV', { screen: 'MAIN_SETTINGS' }),
            accessibilityLabel: t('global:settings.title')
          }
        ]}
      />
      {isWalletOperational ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-start' }}>
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
              label: t(
                'wallet:credentialIssuance.addcredential.homebuttonlabel'
              ),
              icon: 'add',
              onPress: () => {
                navigation.navigate('MAIN_WALLET_NAV', {
                  screen: 'CREDENTIAL_ISSUANCE_LIST'
                });
              },
              iconPosition: 'end'
            }
          }}
        >
          <FlatList
            scrollEnabled={false}
            data={credentials.credentials}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('MAIN_WALLET_NAV', {
                    screen: 'PRESENTATION_CREDENTIAL_DETAILS',
                    params: { credentialType: item.credentialType }
                  })
                }
              >
                <CredentialCard credentialType={item.credentialType} />
                <VSpacer size={8} />
              </Pressable>
            )}
          />
        </IOScrollView>
      )}
    </>
  );
};

export default WalletHome;
