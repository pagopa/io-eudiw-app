import * as React from "react";
import {
  View,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet
} from "react-native";
import {
  Avatar,
  Body,
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  FooterWithButtons,
  ForceScrollDownView,
  H1,
  H2,
  HSpacer,
  IOStyles,
  Icon,
  IconContained,
  LabelSmall,
  ListItemHeader,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import interno from "../../../../../../img/features/itwallet/interno.png";
import { useIOSelector } from "../../../../../store/hooks";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import I18n from "../../../../../i18n";
import ItwBulletList from "../../../components/ItwBulletList";
import {
  getRequestedClaims,
  ISSUER_MOCK_NAME
} from "../../../utils/itwMocksUtils";
import { itwShowCancelAlert } from "../../../utils/itwAlertsUtils";
import ROUTES from "../../../../../navigation/routes";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/itwErrorsUtils";
import ItwTextInfo from "../../../components/ItwTextInfo";
import { useItwInfoBottomSheet } from "../../../hooks/useItwInfoBottomSheet";
import { itwPersistedCredentialsValuePidSelector } from "../../../store/reducers/itwPersistedCredentialsReducer";
import { StoredCredential } from "../../../utils/itwTypesUtils";
import {
  itwIssuanceCredentialChecksSelector,
  itwIssuanceCredentialChecksValueSelector
} from "../../../store/reducers/itwIssuanceCredentialReducer";
import {
  getEvidenceOrganizationName,
  parseClaims
} from "../../../utils/itwClaimsUtils";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import ItwMarkdown from "../../../components/ItwMarkdown";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  ItwRequiredClaimsList,
  RequiredClaim
} from "../../../components/ItwRequiredClaimsList";

/**
 * This screen displays the information about the credential that is going to be shared
 * with the issuer.
 */
const ItwIssuanceCredentialAuthScreen = () => {
  const pid = useIOSelector(itwPersistedCredentialsValuePidSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const preliminaryChecks = useIOSelector(
    itwIssuanceCredentialChecksValueSelector
  );
  const credentialName = O.isSome(preliminaryChecks)
    ? preliminaryChecks.value.displayData.title
    : "";
  const toast = useIOToast();

  useHeaderSecondLevel({ title: "" });

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen and show a toast.
   */
  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME });
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
          <H2>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.title",
              { credentialName }
            )}
          </H2>
          <ItwMarkdown>
            {I18n.t(
              "features.itWallet.issuing.credentialsIssuingInfoScreen.subtitle",
              {
                authSource: ISSUER_MOCK_NAME
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
                navigation.navigate(ITW_ROUTES.ISSUANCE.CREDENTIAL.PREVIEW)
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

  const PidOrErrorView = () =>
    pipe(
      pid,
      O.fold(
        () => <ErrorView />,
        pid => <ContentView pid={pid} />
      )
    );

  return <PidOrErrorView />;
};
export default ItwIssuanceCredentialAuthScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});
