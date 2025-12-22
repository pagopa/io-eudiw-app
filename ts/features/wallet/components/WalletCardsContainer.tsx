import { VStack } from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { ItwWalletCardsContainer } from "./ItwWalletCardsContainer";
import { useAppSelector } from "../../../store";
import { lifecycleIsOperationalSelector, lifecycleIsValidSelector } from "../store/lifecycle";
import { ItwUpgradeBanner } from "./ItwUpgradeBanner";

/**
 * A component which renders the wallet cards container
 * It handles the loading state, which is displayed when the wallet is empty and the cards are still loading,
 * and the empty state
 */
const WalletCardsContainer = () => {
  const shouldRenderItwCardsContainer = useAppSelector(
    lifecycleIsValidSelector
  );
  const shouldRenderItwActivationBanner = useAppSelector(lifecycleIsOperationalSelector)

  useDebugInfo({shouldRenderItwCardsContainer, shouldRenderItwActivationBanner})

  // Content to render in the wallet screen, based on the current state
  // TODO check if it's worth it to use the wallet skeleton
  const walletContent = useMemo(() => {
    return (
      <View testID="walletCardsContainerTestID" style={{ flex: 1 }}>
        {shouldRenderItwCardsContainer && <ItwWalletCardsContainer />}
      </View>
    );
  }, [
    shouldRenderItwCardsContainer
  ]);

  return (
    <Animated.View
      style={{ flex: 1, paddingTop: 16 }}
      layout={LinearTransition.duration(200)}
    >
      {shouldRenderItwActivationBanner && <WalletBannersContainer />}
      {walletContent}
    </Animated.View>
  );
};

/**
 * Renders the banners that are displayed at the top of the wallet screen
 */
const WalletBannersContainer = memo(() => (
  <VStack space={16}>
    <ItwUpgradeBanner/>
    {/* Dummy view wich adds a spacer in case one of the above banners is rendered */}
    <View />
  </VStack>
));


export {
  ItwWalletCardsContainer,
  WalletCardsContainer
};
