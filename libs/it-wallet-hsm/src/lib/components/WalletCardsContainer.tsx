import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { useAppSelector } from '../store';
import { lifecycleIsValidSelector } from '../store/lifecycle';
import { ItwWalletCardsContainer } from './ItwWalletCardsContainer';

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const shouldRenderItwCardsContainer = useAppSelector(
    lifecycleIsValidSelector
  );

  useDebugInfo({
    shouldRenderItwCardsContainer
  });

  // Content to render in the wallet screen, based on the current state
  const walletContent = useMemo(
    () => (
      <View style={{ flex: 1 }} testID="walletCardsContainerTestID">
        {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
      </View>
    ),
    [shouldRenderItwCardsContainer]
  );

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={{ flex: 1, paddingTop: 16 }}
    >
      {walletContent}
    </Animated.View>
  );
};

export { WalletCardsContainer };
