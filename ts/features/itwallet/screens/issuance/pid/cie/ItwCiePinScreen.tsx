import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from "react-native";
import {
  Body,
  ButtonSolid,
  H2,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import variables from "../../../../../../theme/variables";
import { setAccessibilityFocus } from "../../../../../../utils/accessibility";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { CieRequestAuthenticationOverlay } from "../../../../components/cie/CieRequestAuthenticationOverlay";
import { itwNfcIsEnabled } from "../../../../store/actions/itwIssuancePidCieActions";
import ItwTextInfo from "../../../../components/ItwTextInfo";
import CiePinpad from "../../../../components/cie/CiePinpad";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch } from "../../../../../../store/hooks";

// TODO: swap <Body> with <Markdown>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 16
  }
});

const CIE_PIN_LENGTH = 8;

const getContextualHelp = () => ({
  title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
  body: () => <Body>{I18n.t("authentication.cie.pin.contextualHelpBody")}</Body>
});

const ItwCiePinScreen = () => {
  const dispatch = useIODispatch();

  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.cie.pinScreen.title"),
    contextualHelp: getContextualHelp(),
    supportRequest: true
  });

  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const [pin, setPin] = useState("");
  const pinPadViewRef = useRef<View>(null);
  const [authUrlGenerated, setAuthUrlGenerated] = useState<string | undefined>(
    undefined
  );

  const handleAuthenticationOverlayOnClose = useCallback(() => {
    setPin("");
    setAuthUrlGenerated(undefined);
    hideModal();
  }, [setPin, setAuthUrlGenerated, hideModal]);

  useEffect(() => {
    if (authUrlGenerated !== undefined) {
      navigation.navigate(ITW_ROUTES.ISSUANCE.PID.CIE.CARD_READER_SCREEN, {
        ciePin: pin,
        authorizationUri: authUrlGenerated
      });
      handleAuthenticationOverlayOnClose();
    }
  }, [
    handleAuthenticationOverlayOnClose,
    authUrlGenerated,
    hideModal,
    navigation,
    pin
  ]);

  const showModal = () => {
    dispatch(itwNfcIsEnabled.request());
    Keyboard.dismiss();
    showAnimatedModal(
      <CieRequestAuthenticationOverlay
        onClose={handleAuthenticationOverlayOnClose}
        onSuccess={setAuthUrlGenerated}
      />,
      BottomTopAnimation
    );
  };

  const doSetAccessibilityFocus = useCallback(() => {
    setAccessibilityFocus(pinPadViewRef, 100 as Millisecond);
  }, [pinPadViewRef]);

  return (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        <H2>{I18n.t("features.itWallet.cie.pinScreen.title")}</H2>
        <VSpacer size={16} />
        <View style={styles.container} accessible={true} ref={pinPadViewRef}>
          <CiePinpad
            pin={pin}
            pinLength={CIE_PIN_LENGTH}
            onPinChanged={setPin}
            onSubmit={showModal}
          />
        </View>
        <VSpacer size={32} />
        <ItwTextInfo
          content={I18n.t("features.itWallet.cie.pinScreen.description")}
        />
      </ScrollView>
      <View style={IOStyles.horizontalContentPadding}>
        <ButtonSolid
          onPress={showModal}
          label={I18n.t("global.buttons.continue")}
          accessibilityLabel={I18n.t("global.buttons.continue")}
          fullWidth={true}
          disabled={pin.length !== CIE_PIN_LENGTH}
        />
        <VSpacer size={16} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        keyboardVerticalOffset={Platform.select({
          ios: 0,
          android: variables.contentPadding
        })}
      />
    </SafeAreaView>
  );
};

export default ItwCiePinScreen;
