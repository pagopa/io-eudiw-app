import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { Alert } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useAppSelector } from '../store';
import { selectWalletCards } from '../store/credentials';
import { selectIsRemoteKeyLocked } from '../store/instance';
import { lifecycleIsValidSelector } from '../store/lifecycle';
import { ItwWalletIdCard } from './ItwWalletIdCard';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';

export const ItwWalletCardsContainer = () => {
  const cards = useAppSelector(selectWalletCards);
  const isNewItwRenderable = useAppSelector(lifecycleIsValidSelector);
  const isRemoteKeyLocked = useAppSelector(selectIsRemoteKeyLocked);
  const navigation = useNavigation();
  const { t } = useTranslation('hsm');

  useDebugInfo({
    itw: {
      cards
    }
  });

  return (
    <View style={styles.cardsWrapper}>
      {isNewItwRenderable && isRemoteKeyLocked && (
        <View style={styles.alert}>
          <Alert
            action={t('presentation.remoteKeyLocked.alert.action')}
            content={t('presentation.remoteKeyLocked.alert.content')}
            onPress={() =>
              navigation.navigate('MAIN_WALLET_NAV', {
                params: { isRecovering: true },
                screen: 'PID_ISSUANCE_ID_METHOD'
              })
            }
            variant="error"
          />
        </View>
      )}
      {isNewItwRenderable && <ItwWalletIdCard isStacked={cards.length > 0} />}
      <WalletCardsCategoryContainer
        cards={cards}
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    marginBottom: 16,
    marginHorizontal: 8
  },
  cardsWrapper: {
    marginHorizontal: -8
  }
});
