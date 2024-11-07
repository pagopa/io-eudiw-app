import React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Body,
  FeatureInfo,
  FooterWithButtons,
  H1,
  H6,
  HSpacer,
  IOStyles,
  Icon,
  IconContained,
  LabelSmall,
  VSpacer,
  ForceScrollDownView,
  ContentWrapper,
  H2,
  ListItemHeader,
  FooterActions
} from "@pagopa/io-app-design-system";
import { Image, StyleSheet, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOSelector } from "../../../../../../store/hooks";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import I18n from "../../../../../../i18n";
import { itwShowCancelAlert } from "../../../../utils/itwAlertsUtils";
import ItwTextInfo from "../../../../components/ItwTextInfo";
import ItwBulletList from "../../../../components/ItwBulletList";
import { ISSUER_MOCK_NAME, rpPidMock } from "../../../../utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import interno from "../../../../../../../img/features/itwallet/interno.png";
import { useItwInfoBottomSheet } from "../../../../hooks/useItwInfoBottomSheet";
import ItwKoView from "../../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../../utils/itwErrorsUtils";
import ROUTES from "../../../../../../navigation/routes";
import { itwPersistedCredentialsValuePidSelector } from "../../../../store/reducers/itwPersistedCredentialsReducer";
import { StoredCredential } from "../../../../utils/itwTypesUtils";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import {
  ItwRequiredClaimsList,
  RequiredClaim
} from "../../../../components/ItwRequiredClaimsList";
import { parseClaims } from "../../../../utils/itwClaimsUtils";
import ItwMarkdown from "../../../../components/ItwMarkdown";

const ItwPrRemotePidDataScreen = () => {
  const pid = useIOSelector(itwPersistedCredentialsValuePidSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  useHeaderSecondLevel({
    title: I18n.t(
      "features.itWallet.presentation.pidAttributesScreen.headerTitle"
    )
  });

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen.
   */
  const alertOnPress = () => {
    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.ITWALLET_HOME
    });
  };

  const ContentView = ({ pid }: { pid: StoredCredential }) => {
    const claims = parseClaims(pid.parsedCredential);
    const requiredClaims = claims.map(
      claim =>
        ({
          claim,
          source: pid.credentialType
        } as RequiredClaim)
    );
    return (
      <ForceScrollDownView>
        <ContentWrapper>
          <VSpacer size={24} />
          <View style={styles.header}>
            <IconContained
              icon={"device"}
              color={"neutral"}
              variant={"tonal"}
            />
            <HSpacer size={8} />
            <IconContained
              icon={"transactions"}
              color={"neutral"}
              variant={"tonal"}
            />
            <HSpacer size={8} />
            <IconContained
              icon={"institution"}
              color={"neutral"}
              variant={"tonal"}
            />
          </View>
          <VSpacer size={24} />
          <H2>{I18n.t("features.itWallet.presentation.dataScreen.title")}</H2>
          <ItwMarkdown>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.subtitle",
              {
                authSource: rpPidMock.organizationName
              }
            )}
          </ItwMarkdown>
          <VSpacer size={8} />
          <ListItemHeader
            label={I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.requiredClaims"
            )}
            iconName="security"
            iconColor="grey-700"
          />

          <ItwRequiredClaimsList items={requiredClaims} />
          <VSpacer size={24} />
          <FeatureInfo
            iconName="fornitori"
            body={I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.disclaimer.0"
            )}
          />
          <VSpacer size={24} />
          <FeatureInfo
            iconName="trashcan"
            body={I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.disclaimer.1"
            )}
          />
          <VSpacer size={32} />
          <ItwMarkdown
            styles={{ body: { fontSize: 14 } }}
            onLinkOpen={() => null}
          >
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.tos"
            )}
          </ItwMarkdown>
        </ContentWrapper>
        <FooterActions
          fixed={false}
          actions={{
            type: "TwoButtons",
            primary: {
              label: I18n.t("global.buttons.continue"),
              onPress: () =>
                navigation.navigate(ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT)
            },
            secondary: {
              label: I18n.t("global.buttons.cancel"),
              onPress: () => itwShowCancelAlert(alertOnPress)
            }
          }}
        />
      </ForceScrollDownView>
    );
  };

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
    return <ItwKoView {...mappedError} />;
  };

  const DecodePidOrErrorView = () =>
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        some => <ContentView pid={some} />
      )
    );

  return <DecodePidOrErrorView />;
};

export default ItwPrRemotePidDataScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});
