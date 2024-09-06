import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import {
  Banner,
  ButtonSolidProps,
  H2,
  IOStyles,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useDispatch } from "react-redux";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import ItwFooterVerticalButtons from "../../../components/ItwFooterVerticalButtons";
import { itwShowCancelAlert } from "../../../utils/itwAlertsUtils";
import ROUTES from "../../../../../navigation/routes";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import ItwKoView from "../../../components/ItwKoView";
import {
  getItwGenericMappedError,
  ItWalletError
} from "../../../utils/itwErrorsUtils";
import ItwCredentialClaimsList from "../../../components/ItwCredentialClaimsList";
import { StoredCredential } from "../../../utils/itwTypesUtils";
import { itwIssuancePidValueSelector } from "../../../store/reducers/itwIssuancePidReducer";
import { itwIssuancePidStore } from "../../../store/actions/itwIssuancePidActions";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import ItwClaimsWrapper from "../../../components/ItwClaimsWrapper";
import { CredentialType } from "../../../utils/itwMocksUtils";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwIssuancePidPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const pid = useIOSelector(itwIssuancePidValueSelector);
  const dispatch = useDispatch();

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPid - the decoded PID
   */
  const ContentView = ({ pid }: { pid: StoredCredential }) => {
    const bannerViewRef = React.useRef(null);
    const toast = useIOToast();

    useHeaderSecondLevel({
      title: I18n.t("features.itWallet.issuing.title"),
      supportRequest: true
    });

    const alertOnPress = () => {
      toast.info(
        I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
      );
      navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME });
    };

    const bottomButtonProps: ButtonSolidProps = {
      fullWidth: true,
      color: "contrast",
      label: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      onPress: () => itwShowCancelAlert(alertOnPress)
    };

    const topButtonProps = (pid: StoredCredential): ButtonSolidProps => ({
      color: "primary",
      fullWidth: true,
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.add"
      ),
      icon: "add",
      iconPosition: "end",
      onPress: () => dispatch(itwIssuancePidStore(pid)),
      label: I18n.t("features.itWallet.issuing.pidPreviewScreen.buttons.add")
    });

    return (
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <VSpacer />
          <View>
            <View style={IOStyles.horizontalContentPadding}>
              <H2>
                {I18n.t("features.itWallet.issuing.pidPreviewScreen.title", {
                  credentialName: pid.displayData.title
                })}
              </H2>
            </View>
            <VSpacer size={24} />
            <ItwClaimsWrapper
              displayData={{ ...pid.displayData, textColor: "black" }}
              type={CredentialType.PID}
            >
              <>
                <ItwCredentialClaimsList data={pid} />
                <VSpacer />
                <Banner
                  color="neutral"
                  pictogramName="security"
                  title={I18n.t(
                    "features.itWallet.issuing.pidPreviewScreen.banner.title"
                  )}
                  size="big"
                  content={I18n.t(
                    "features.itWallet.issuing.pidPreviewScreen.banner.content"
                  )}
                  action={I18n.t(
                    "features.itWallet.issuing.pidPreviewScreen.banner.actionTitle"
                  )}
                  onPress={() =>
                    navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
                  }
                  viewRef={bannerViewRef}
                />
              </>
            </ItwClaimsWrapper>
          </View>
        </ScrollView>
        <ItwFooterVerticalButtons
          bottomButtonProps={bottomButtonProps}
          topButtonProps={topButtonProps(pid)}
        />
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
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        some => <ContentView pid={some} />
      )
    );

  return <RenderMask />;
};

export default ItwIssuancePidPreviewScreen;
