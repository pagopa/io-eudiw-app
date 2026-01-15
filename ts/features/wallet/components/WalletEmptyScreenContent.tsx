import { Body, IOButton, IOVisualCostants } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ItwDeckImage from '../assets/img/brand/itw_deck_wallet.svg';
import WALLET_ROUTES from '../navigation/routes';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { PoweredByItWalletText } from './PoweredByItWalletText';

const WalletEmptyScreenContent = () => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();

  const handleAddToWalletButtonPress = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
    });
  };

  return (
    <View
      style={styles.container}
      testID="walletEmptyScreenContentItWalletTestID"
    >
      <ItwDeckImage width={140} height={80} />
      <Body color="grey-650" weight="Regular" style={styles.text}>
        {I18n.t('home.screen.emptyMessage', { ns: 'wallet' })}
      </Body>
      <IOButton
        fullWidth
        variant="solid"
        label={I18n.t('home.screen.cta', { ns: 'wallet' })}
        onPress={handleAddToWalletButtonPress}
      />
      <PoweredByItWalletText />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: { textAlign: 'center' }
});

export { WalletEmptyScreenContent };
