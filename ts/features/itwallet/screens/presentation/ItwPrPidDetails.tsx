import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import {
  Banner,
  BlockButtonProps,
  FooterWithButtons,
  VSpacer,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { CredentialType } from "../../utils/itwMocksUtils";
import ItwClaimsWrapper from "../../components/ItwClaimsWrapper";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/itwErrorsUtils";
import { itwPersistedCredentialsValuePidSelector } from "../../store/reducers/itwPersistedCredentialsReducer";
import { StoredCredential } from "../../utils/itwTypesUtils";
import ItwCredentialClaimsList from "../../components/ItwCredentialClaimsList";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 * This screen should be generalized for any verifiable crediential but for now it's only used for the PID.
 */
const ItwPrPidDetails = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const pid = useIOSelector(itwPersistedCredentialsValuePidSelector);
  const bannerViewRef = React.createRef<View>();
  const spacerSize = 32;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  const presentationButton: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.buttons.qrCode"
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.presentation.credentialDetails.buttons.qrCode"
      ),
      icon: "qrCode",
      iconPosition: "end",
      onPress: () =>
        navigation.navigate(ITW_ROUTES.PRESENTATION.PROXIMITY.QRCODE)
    }
  };

  const ContentView = ({ pid }: { pid: StoredCredential }) => (
    <SafeAreaView style={{ ...IOStyles.flex }}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <ItwClaimsWrapper
            displayData={pid.displayData}
            type={CredentialType.PID}
          >
            <ItwCredentialClaimsList data={pid} />
          </ItwClaimsWrapper>
          <VSpacer size={spacerSize} />
          <Banner
            testID={"ItwBannerTestID"}
            viewRef={bannerViewRef}
            color={"neutral"}
            size="big"
            title={I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.banner.title"
            )}
            content={I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.banner.content"
            )}
            pictogramName={"security"}
            action={I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.banner.actionTitle"
            )}
            onPress={() =>
              navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
            }
          />
        </View>
        <VSpacer size={spacerSize} />
      </ScrollView>
      <FooterWithButtons type={"SingleButton"} primary={presentationButton} />
    </SafeAreaView>
  );

  const ErrorView = () => {
    const error = getItwGenericMappedError(navigation.goBack);
    return <ItwKoView {...error} />;
  };

  const DecodedPidOrErrorView = () =>
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        some => <ContentView pid={some} />
      )
    );

  return <DecodedPidOrErrorView />;
};

export default ItwPrPidDetails;
