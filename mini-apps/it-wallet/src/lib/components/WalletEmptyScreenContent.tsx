import { Body, IOButton, IOVisualCostants } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import ItwDeckImage from '../../assets/img/brand/itw_deck_wallet.svg';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../navigation/pidIssuance/routes';
import { PoweredByItWalletText } from './PoweredByItWalletText';

const WalletEmptyScreenContent = () => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();

  const { t } = useTranslation(['wallet']);

  const handleAddToWalletButtonPress = () => {
    navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
      screen: PID_ISSUANCE_ROUTES.INSTANCE_CREATION
    });
  };

  return (
    <View
      style={styles.container}
      testID="walletEmptyScreenContentItWalletTestID"
    >
      <ItwDeckImage height={80} width={140} />
      <Body color="grey-650" style={styles.text} weight="Regular">
        {t('home.screen.emptyMessage')}
      </Body>
      <IOButton
        label={t('wallet:home.screen.cta')}
        onPress={handleAddToWalletButtonPress}
        variant="solid"
      />
      <PoweredByItWalletText />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    paddingHorizontal: IOVisualCostants.appMarginDefault
  },
  text: { textAlign: 'center' }
});

export { WalletEmptyScreenContent };
