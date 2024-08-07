import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  IOColors,
  ContentWrapper,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ItwCredentialClaimsList from "../../components/ItwCredentialClaimsList";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import ItwCredentialCard from "../../components/ItwCredentialCard";
import { ItwPresentationDetailFooter } from "../../components/ItwPresentationDetailFooter";

const themeColor = IOColors["blueItalia-600"];
// TODO: use the real credential update time
const today = new Date();

export type ItwPrCredentialDetailsScreenNavigationParams = {
  credential: StoredCredential;
};

type ItwCredentialDetailscreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAILS"
>;

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwPrCredentialDetailsScreen = () => {
  const route = useRoute<ItwCredentialDetailscreenRouteProps>();
  const { credential } = route.params;

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    variant: "contrast",
    backgroundColor: themeColor
  });

  /**
   * Content view which asks the user to confirm the issuance of the credential.
   * @param data - the issuance result data of the credential used to display the credential.
   */
  const ContentView = ({ data }: { data: StoredCredential }) => {
    return (
      <>
        <FocusAwareStatusBar
          backgroundColor={themeColor}
          barStyle="light-content"
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={styles.cardContainer}>
            <ItwCredentialCard
              parsedCredential={data.parsedCredential}
              display={data.displayData}
              type={data.credentialType}
            />
            <View
              style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
            />
          </View>
          <ContentWrapper>
            <ItwCredentialClaimsList data={data} />
            <ItwPresentationDetailFooter lastUpdateTime={today} />
          </ContentWrapper>
        </ScrollView>
      </>
    );
  };

  return <ContentView data={credential} />;
};

export default ItwPrCredentialDetailsScreen;

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    paddingHorizontal: IOVisualCostants.appMarginDefault
  },
  cardBackdrop: {
    height: "200%", // Twice the card in order to avoid the white background when the scrollview bounces
    position: "absolute",
    top: "-130%", // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  }
});
