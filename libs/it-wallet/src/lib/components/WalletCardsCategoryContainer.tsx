import { WithTestID } from '@pagopa/io-app-design-system';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition
} from 'react-native-reanimated';
import { WalletCard } from '../types';
import { ItwCredentialWalletCard } from './credential/ItwCredentialWalletCard';

type WalletCardsCategoryContainerProps = WithTestID<{
  cards: ReadonlyArray<WalletCard>;
}>;

// The item layout animation has a bug on Android for a FlatList that doesn't have a fixed height [https://github.com/software-mansion/react-native-reanimated/issues/5728]
// * The animations work perfectly when an item enters, but when removing an item, there is always a UI bug where the last item becomes invisible during rendering.
// * Even with an hardcoded height with the onLayout event, the bug is still present
// * The workaround is to disable the layout animation on Android
const itemLayoutAnimation =
  Platform.OS !== 'android' ? LinearTransition.duration(200) : undefined;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  testID
}: WalletCardsCategoryContainerProps) => {
  return (
    <Animated.FlatList
      testID={testID}
      scrollEnabled={false}
      data={cards}
      renderItem={({ index, item }) => {
        // renderWalletCardFn is not of use for the eudiw scenarios because only Itw is supported
        // renderWalletCardFn(item, index < cards.length - 1)
        const { key: _, type: __, ...cardProps } = item;

        return (
          <ItwCredentialWalletCard
            key={item.key}
            testID={`walletCardTestID_${item.type}_${item.key}`}
            cardProps={cardProps}
            isStacked={index < cards.length - 1}
          />
        );
      }}
      itemLayoutAnimation={itemLayoutAnimation}
      layout={LinearTransition.duration(200)}
      contentContainerStyle={styles.container}
      entering={FadeInDown.duration(150)}
      exiting={FadeOutDown.duration(150)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 16
  }
});
