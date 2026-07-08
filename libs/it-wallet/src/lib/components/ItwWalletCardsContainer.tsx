import { selectWalletCards } from '../store/credentials';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';
import { useAppSelector } from '../store';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { StyleSheet, View } from 'react-native';
import { lifecycleIsValidSelector } from '../store/lifecycle';
import { ItwWalletIdCard } from './ItwWalletIdCard';

export const ItwWalletCardsContainer = () => {
  const cards = useAppSelector(selectWalletCards);
  const isNewItwRenderable = useAppSelector(lifecycleIsValidSelector);

  useDebugInfo({
    itw: {
      cards
    }
  });

  return (
    <View style={styles.cardsWrapper}>
      {isNewItwRenderable && <ItwWalletIdCard isStacked={cards.length > 0} />}
      <WalletCardsCategoryContainer
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
        cards={cards}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardsWrapper: {
    marginHorizontal: -8
  }
});
