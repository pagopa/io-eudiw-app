import { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import {
  lifecycleIsOperationalSelector,
  lifecycleIsValidSelector
} from '../store/lifecycle';
import { ItwWalletCardsContainer } from './ItwWalletCardsContainer';
import { WalletEmptyScreenContent } from './WalletEmptyScreenContent';
import { useAppSelector } from '../store';

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const shouldRenderItwCardsContainer = useAppSelector(
    lifecycleIsValidSelector
  );
  const shouldRenderItwActivationBanner = useAppSelector(
    lifecycleIsOperationalSelector
  );

  useDebugInfo({
    shouldRenderItwCardsContainer,
    shouldRenderItwActivationBanner
  });

  // Content to render in the wallet screen, based on the current state
  const walletContent = useMemo(() => {
    if (shouldRenderItwActivationBanner) {
      return <WalletEmptyScreenContent />;
    }

    return (
      <View testID="walletCardsContainerTestID" style={{ flex: 1 }}>
        {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
      </View>
    );
  }, [shouldRenderItwCardsContainer, shouldRenderItwActivationBanner]);

  return (
    <Animated.View
      style={{ flex: 1, paddingTop: 16 }}
      layout={LinearTransition.duration(200)}
    >
      {walletContent}
    </Animated.View>
  );
};

export { WalletCardsContainer };
