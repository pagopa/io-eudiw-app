/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import React, { useState, useEffect, useCallback } from "react";
import { Alert, BackHandler } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { type Route } from "@react-navigation/core";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import WebView from "react-native-webview";
import { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { originSchemasWhiteList } from "../../../../../../utils/authentication";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { itwLoginFailure } from "../../../../store/actions/itwIssuancePidCieActions";
import { useIODispatch } from "../../../../../../store/hooks";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";

export type ItwCieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
  pidData: PidData;
};

type ItwCieConsentDataUsageScreenRouteProps = Route<
  "ITW_ISSUANCE_PID_CIE_CONSENT_DATA_USAGE",
  ItwCieConsentDataUsageScreenNavigationParams
>;

const loaderComponent = (
  <LoadingSpinnerOverlay loadingOpacity={1.0} isLoading={true}>
    <VSpacer size={16} />
  </LoadingSpinnerOverlay>
);

// This JS code is used to customize the page
// to avoid session error. This is a temporary solution
// only for the PoC purpose
const jsCode = `
  const article = document.querySelector('article');
  article.className = 'u-padding-left-xl';
  const div = document.createElement('div');
  div.innerHTML = \`
    <p class="u-padding-bottom-l">Request for CIE access Level 3<br>The following data is about to be sent to:</p>
    <p class="u-padding-bottom-l">EUDIW - the European Wallet app</p>
    <p class="u-padding-bottom-xs">First Name</p>
    <p class="u-padding-bottom-xs">Last Name</p>
    <p class="u-padding-bottom-xs">Date of Birth</p>
    <p class="u-padding-bottom-xs">Taxe code</p>
  \`;
  article.replaceChildren(div);
`;

const ItwCieConsentDataUsageScreen = () => {
  const route = useRoute<ItwCieConsentDataUsageScreenRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();

  const [hasError, setHasError] = useState(false);

  const resetNavigation = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
    });
  }, [navigation]);

  const showAbortAlert = useCallback((): boolean => {
    // if the screen is in error state, skip the confirmation alert to go back at the landing screen
    if (hasError) {
      resetNavigation();
      return true;
    }
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: resetNavigation
        }
      ]
    );
    return true;
  }, [hasError, resetNavigation]);

  useHeaderSecondLevel({
    title: I18n.t("authentication.cie.genericTitle"),
    supportRequest: true,
    goBack: hasError ? undefined : showAbortAlert
  });

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      showAbortAlert
    );
    return () => {
      subscription.remove();
    };
  }, [showAbortAlert]);

  // Instead of using the URI passed as a parameter, we use this
  // to get a generic ipzs welcome page and use the JS code
  // replacing the content with only the necessary data.
  // NOTE: This is a temporary solution only for the PoC purpose
  const cieAuthorizationUri =
    "https://collaudo.idserver.servizicie.interno.gov.it/idp";

  const handleWebViewError = () => {
    setHasError(true);
  };

  const handleHttpError = (event: WebViewHttpErrorEvent) => {
    const error = new Error(
      `HTTP error ${event.nativeEvent.description} with Authorization uri`
    );
    dispatch(itwLoginFailure({ error, idp: "cie" }));
  };

  const getContent = () => (
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      textZoom={100}
      originWhitelist={originSchemasWhiteList}
      source={{ uri: decodeURIComponent(cieAuthorizationUri) }}
      javaScriptEnabled={true}
      renderLoading={() => loaderComponent}
      injectedJavaScript={jsCode}
      onMessage={_ => {}}
      onError={handleWebViewError}
      onHttpError={handleHttpError}
    />
  );

  return (
    <>
      {getContent()}
      <FooterWithButtons
        primary={{
          type: "Outline",
          buttonProps: {
            color: "primary",
            accessibilityLabel: I18n.t(
              "features.itWallet.issuing.infoConsent.footer.cancel"
            ),
            onPress: resetNavigation,
            label: I18n.t("features.itWallet.issuing.infoConsent.footer.cancel")
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            color: "primary",
            accessibilityLabel: I18n.t(
              "features.itWallet.issuing.infoConsent.footer.confirm"
            ),
            onPress: () =>
              navigation.navigate(ITW_ROUTES.ISSUANCE.PID.REQUEST, {
                pidData: route.params.pidData
              }),
            label: I18n.t(
              "features.itWallet.issuing.infoConsent.footer.confirm"
            )
          }
        }}
        type="TwoButtonsInlineHalf"
      />
    </>
  );
};

export default ItwCieConsentDataUsageScreen;
