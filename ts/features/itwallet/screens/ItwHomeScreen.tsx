import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  ButtonLink,
  ButtonSolid,
  VSpacer,
  IOStyles,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { ItwActionBanner } from "../components/ItwActionBanner";
import { useIOSelector } from "../../../store/hooks";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { itwLifecycleIsOperationalSelector } from "../store/reducers/itwLifecycleReducer";
import {
  itwPersistedCredentialsValuePidSelector,
  itwPersistedCredentialsValueSelector
} from "../store/reducers/itwPersistedCredentialsReducer";
import { useItwResetFlow } from "../hooks/useItwResetFlow";
import ItwCredentialCard from "../components/ItwCredentialCard";
import { CredentialType } from "../utils/itwMocksUtils";
import ItwKoView from "../components/ItwKoView";
import { StoredCredential } from "../utils/itwTypesUtils";

/**
 * IT-Wallet home screen which contains a top bar with categories, an activation banner and a list of wallet items based on the selected category.
 * It also a label to reset the wallet credentials and a button to add a new credential which only works if the experimental feature flag is true.
 */
const ItwHomeScreen = () => {
  const navigation = useIONavigation();
  const { present, bottomSheet } = useItwResetFlow();
  const isItWalletOperational = useIOSelector(
    itwLifecycleIsOperationalSelector
  );
  const decodedPid = useIOSelector(itwPersistedCredentialsValuePidSelector);
  const credentials = useIOSelector(itwPersistedCredentialsValueSelector);
  const pidType = CredentialType.PID;

  /**
   * Condionally navigate to the credentials catalog screen if the experimental feature flag is true.
   * Otherwise do nothing.
   */
  const onPressAddCredentials = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG
    });
  };

  /**
   * Temporary function to navigate to the checks screen on long press of a credential.
   * TODO: remove this function the qr code scanning is implemented.
   */
  const onLongPressCredential = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.INIT
    });
  };

  const ContentView = ({ pid }: { pid: StoredCredential }) => (
    <View
      style={{
        ...IOStyles.flex,
        justifyContent: "flex-start"
      }}
    >
      <ScrollView>
        <VSpacer />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.PID.DETAILS
            })
          }
        >
          <ItwCredentialCard
            parsedCredential={pid.parsedCredential}
            display={pid.displayData}
            type={pidType}
          />
          <VSpacer />
        </Pressable>
        {credentials
          .filter(O.isSome)
          .map(_ => _.value)
          .map((credential, idx) => (
            <Pressable
              accessibilityRole="button"
              onLongPress={onLongPressCredential}
              onPress={() =>
                navigation.navigate(ITW_ROUTES.MAIN, {
                  screen: ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS,
                  params: { credential }
                })
              }
              key={`${credential.displayData.title}-${idx}`}
            >
              <ItwCredentialCard
                parsedCredential={credential.parsedCredential}
                display={credential.displayData}
                type={credential.credentialType}
              />
              <VSpacer />
            </Pressable>
          ))}
        <View
          style={{
            ...IOStyles.flex,
            ...IOStyles.selfCenter,
            justifyContent: "flex-end"
          }}
        >
          <View
            style={{
              ...IOStyles.flex,
              justifyContent: "flex-end"
            }}
          />
        </View>
      </ScrollView>
      <View style={{ justifyContent: "flex-end" }}>
        <View style={IOStyles.selfCenter}>
          <ButtonLink
            label={I18n.t("features.itWallet.homeScreen.reset.label")}
            onPress={() => present()}
          />
        </View>
        <VSpacer />
        <ButtonSolid
          icon="add"
          onPress={onPressAddCredentials}
          label={I18n.t("features.itWallet.homeScreen.buttons.addCredential")}
          accessibilityLabel={I18n.t(
            "features.itWallet.homeScreen.buttons.addCredential"
          )}
          iconPosition="end"
          fullWidth
        />
        <VSpacer />
      </View>
    </View>
  );

  const RenderMask = () =>
    pipe(
      decodedPid,
      O.fold(
        () => (
          <ItwKoView
            title={I18n.t("global.jserror.title")}
            pictogram="fatalError"
            action={{
              accessibilityLabel: I18n.t(
                "features.itWallet.homeScreen.reset.label"
              ),
              label: I18n.t("features.itWallet.homeScreen.reset.label"),
              onPress: () => present()
            }}
          />
        ),
        some => <ContentView pid={some} />
      )
    );

  return (
    <>
      <HeaderFirstLevel
        title={I18n.t("global.navigator.itwallet")}
        type="twoActions"
        firstAction={{
          icon: "help",
          onPress: () => {
            Alert.alert("Contextual Help");
          },
          accessibilityLabel: ""
        }}
        secondAction={{
          icon: "coggle",
          onPress: () => {
            Alert.alert("Contextual coggle");
          },
          accessibilityLabel: ""
        }}
      />
      <View style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}>
        {isItWalletOperational ? (
          <View style={{ ...IOStyles.flex, justifyContent: "flex-start" }}>
            <ItwActionBanner
              title={I18n.t("features.itWallet.actionBanner.title")}
              content={I18n.t("features.itWallet.actionBanner.description")}
              action={I18n.t("features.itWallet.actionBanner.action")}
            />
          </View>
        ) : (
          <RenderMask />
        )}
        {bottomSheet}
      </View>
    </>
  );
};

export default ItwHomeScreen;
