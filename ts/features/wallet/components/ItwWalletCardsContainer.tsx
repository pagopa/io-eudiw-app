import { ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import React from "react";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIOBottomSheetModal } from "../../../hooks/useBottomSheet";
import { useAppSelector } from "../../../store";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";

//TODO is withWalletCategoryFilter necessary ?
export const ItwWalletCardsContainer = () => {
  const isNewItwRenderable = useAppSelector(itwShouldRenderNewItWalletSelector);
  const shouldHideEidAlert = useAppSelector(itwShouldHideEidLifecycleAlert);
  const navigation = useNavigation();
  const cards = useIOSelector(state =>
    selectWalletCardsByCategory(state, "itw")
  );
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useIOSelector(itwCredentialsEidExpirationSelector);
  const isEidExpired = eidStatus === "jwtExpired";
  const iconColor = useItwStatusIconColor(isEidExpired);

  useDebugInfo({
    itw: {
      eidStatus,
      eidExpiration,
      cards
    }
  });

  const eidInfoBottomSheet = useIOBottomSheetModal({
    title: <ItwEidInfoBottomSheetTitle isExpired={isEidExpired} />,
    // Navigation does not seem to work when the bottom sheet's component is not inline
    component: <ItwEidInfoBottomSheetContent navigation={navigation} />
  });

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const handleNavigateToItwId = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  const sectionHeader = useMemo((): React.ReactElement => {
    if (isNewItwRenderable) {
      return (
        <>
          <ItwWalletIdStatus
            pidStatus={eidStatus}
            pidExpiration={eidExpiration}
            onPress={handleNavigateToItwId}
          />
          <VSpacer size={16} />
        </>
      );
    }
    return (
      <ListItemHeader
        testID={"walletCardsCategoryItwHeaderTestID"}
        iconName={"legalValue"}
        iconColor={iconColor}
        label={I18n.t("features.wallet.cards.categories.itw")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            accessibilityLabel: I18n.t(
              "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
            ),
            label: I18n.t(
              "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
            ),
            onPress: eidInfoBottomSheet.present,
            testID: "walletCardsCategoryItwActiveBadgeTestID"
          }
        }}
      />
    );
  }, [
    iconColor,
    isNewItwRenderable,
    eidInfoBottomSheet.present,
    eidStatus,
    eidExpiration,
    handleNavigateToItwId
  ]);

  return (
    <>
      <WalletCardsCategoryContainer
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
        cards={cards}
        header={sectionHeader}
        topElement={
          <>
            <ItwWalletReadyBanner />
            {!shouldHideEidAlert && (
              <ItwEidLifecycleAlert
                lifecycleStatus={LIFECYCLE_STATUS}
                navigation={navigation}
              />
            )}
          </>
        }
      />
      {eidInfoBottomSheet.bottomSheet}
    </>
  );
});
