import { Banner } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../../../store";
import { itwShouldRenderWalletReadyBannerSelector } from "../store/selectors/wallet";
import WALLET_ROUTES from "../navigation/routes";
import MAIN_ROUTES from "../../../navigation/main/routes";

export const ItwWalletReadyBanner = () => {
  const navigation = useNavigation();
  const shouldRender = useAppSelector(itwShouldRenderWalletReadyBannerSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST
    });
  };

  return (
    <View style={{ marginHorizontal: -8 }}>
      <Banner
        title={
            undefined
        }
        content={I18n.t(
            "features.itWallet.issuance.emptyWallet.readyBanner.content"
        )}
        action={I18n.t(
          "features.itWallet.issuance.emptyWallet.readyBanner.action"
        )}
        color="turquoise"
        onPress={handleOnPress}
        testID="itwWalletReadyBannerTestID"
        pictogramName="itWallet"
      />
    </View>
  );
};
