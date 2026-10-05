import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { StyleSheet, View } from 'react-native';

import { useAppSelector } from '../store';
import { selectWalletCards } from '../store/credentials';
import { lifecycleIsValidSelector } from '../store/lifecycle';
import { ItwWalletIdCard } from './ItwWalletIdCard';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';

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
        cards={cards}
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardsWrapper: {
    marginHorizontal: -8
  }
});
