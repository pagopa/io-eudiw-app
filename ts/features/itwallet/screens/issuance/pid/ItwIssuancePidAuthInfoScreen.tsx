import * as React from "react";
import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Body,
  ButtonSolid,
  H2,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../../../i18n";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { itwWiaStateSelector } from "../../../store/reducers/itwWiaReducer";
import { itwWiaRequest } from "../../../store/actions/itwWiaActions";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import ItwKoView from "../../../components/ItwKoView";
import {
  getItwGenericMappedError,
  ItWalletError
} from "../../../utils/itwErrorsUtils";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { pidDataMock } from "../../../utils/itwMocksUtils";

/**
 * Renders the screen which displays the information about the authentication process to obtain a Wallet Instance.
 */
const ItwIssuancePidAuthInfoScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const wia = useIOSelector(itwWiaStateSelector);

  useOnFirstRender(() => {
    dispatch(itwWiaRequest.request());
  });

  /**
   * Bypass the CIE authentication process and navigate to the PID preview screen by sending
   * PID data from the profile store or a mock if the data is not available.
   */
  const bypassCieLogin = () => {
    navigation.navigate(ITW_ROUTES.ISSUANCE.PID.REQUEST, {
      pidData: {
        name: pidDataMock.name,
        surname: pidDataMock.surname,
        birthDate: pidDataMock.birthDate,
        fiscalCode: pidDataMock.fiscalCode
      }
    });
  };
  /**
   * Loading view component.
   */
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      isLoading
      captionTitle={I18n.t("global.genericWaiting")}
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  /**
   * Containts the content of the screen when the requirements are satisfied.
   */
  const ContentView = () => {
    useHeaderSecondLevel({
      title: "",
      supportRequest: true
    });

    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <H2>{I18n.t("features.itWallet.infoAuthScreen.title")}</H2>
          <VSpacer size={24} />
          <Body>{I18n.t("features.itWallet.infoAuthScreen.subTitle")}</Body>
          <View
            style={[
              IOStyles.alignCenter,
              IOStyles.flex,
              IOStyles.centerJustified
            ]}
          >
            <Pressable
              onLongPress={bypassCieLogin}
              accessibilityLabel={I18n.t(
                "features.itWallet.infoAuthScreen.title"
              )}
            >
              <Pictogram name="identityCheck" size={180} />
            </Pressable>
          </View>
          <View>
            <ButtonSolid
              testID="WalletActivationStart"
              fullWidth
              onPress={() =>
                navigation.navigate(ITW_ROUTES.ISSUANCE.PID.CIE.PIN_SCREEN)
              }
              label={I18n.t("features.itWallet.infoAuthScreen.start")}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  };

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  const RenderMask = () =>
    pot.fold(
      wia,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      _ => <ContentView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, someErr) => <ErrorView error={someErr} />
    );

  return <RenderMask />;
};

export default ItwIssuancePidAuthInfoScreen;

const styles = StyleSheet.create({
  wrapper: {
    ...IOStyles.flex,
    paddingBottom: 16
  }
});
