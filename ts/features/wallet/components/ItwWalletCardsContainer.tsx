import { VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useAppSelector } from "../../../store";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";
import { ItwWalletIdStatus } from "./ItwWalletIdStatus";
import { ItwWalletReadyBanner } from "./ItwWalletReadyBanner";
import { ItwEidLifecycleAlert } from "./ItwEidLifecycleAlert";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";
import { useItwStatusIconColor } from "../hooks/useItwStatusIconColor";
import { itwCredentialsEidExpirationSelector, itwCredentialsEidStatusSelector, selectWalletCards } from "../store/credentials";
import WALLET_ROUTES from "../navigation/routes";
import MAIN_ROUTES from "../../../navigation/main/routes";
import { wellKnownCredential } from "../utils/credentials";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainNavigatorParamsList } from "../../../navigation/main/MainStackNavigator";

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  "jwtExpiring",
  "jwtExpired"
];

//TODO is withWalletCategoryFilter necessary ?
export const ItwWalletCardsContainer = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainNavigatorParamsList>>();
  const cards = useAppSelector(selectWalletCards);
  const eidStatus = useAppSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useAppSelector(itwCredentialsEidExpirationSelector);
  const isEidExpired = eidStatus === "jwtExpired";
  const iconColor = useItwStatusIconColor(isEidExpired);

  useDebugInfo({
    itw: {
      eidStatus,
      eidExpiration,
      cards
    }
  });

  const handleNavigateToItwId = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS,
      params : {
        credentialType : wellKnownCredential.PID
      }
    });
  }, [navigation]);

  const sectionHeader = useMemo((): React.ReactElement => {
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
  }, [
    iconColor,
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
            <ItwEidLifecycleAlert
              lifecycleStatus={LIFECYCLE_STATUS}
              navigation={navigation}
            />
          </>
        }
      />
    </>
  );
};
